import type { AdPlacement, AdContent, AdContextData } from './types';
import { getAdConfig, getAdContent } from './config';

class AdManager {
  private sessionData = new Map<string, number>(); // Track session interactions
  private lastAdTime = new Map<string, number>(); // Track ad cooldowns
  private sessionImpressions = 0;
  private sessionStartTime = Date.now();

  constructor() {
    this.initializeSession();
  }

  private initializeSession() {
    // Generate session ID
    if (!sessionStorage.getItem('ad_session_id')) {
      sessionStorage.setItem(
        'ad_session_id',
        Math.random().toString(36).substr(2, 9)
      );
    }
  }

  /**
   * Determines if an ad should be shown at the given placement
   */
  shouldShowAd(placement: AdPlacement, context: AdContextData): boolean {
    const config = getAdConfig();
    const placementConfig = config.placements[placement];

    // Basic checks
    if (!placementConfig.enabled) return false;
    if (context.isPremium) return false;

    // Respect Do Not Track
    if (
      config.globalSettings.respectDoNotTrack &&
      navigator.doNotTrack === '1'
    ) {
      return false;
    }

    // Check global session limits
    if (this.sessionImpressions >= config.globalSettings.maxAdsPerSession) {
      return false;
    }

    // Check placement session limits
    const placementImpressions = this.sessionData.get(placement) || 0;
    if (placementImpressions >= placementConfig.maxPerSession) {
      return false;
    }

    // Check frequency (every Nth interaction)
    const totalInteractions =
      this.sessionData.get(`${placement}_interactions`) || 0;
    if (totalInteractions % placementConfig.frequency !== 0) {
      return false;
    }

    // Check cooldown between ads
    const lastAdTime = this.lastAdTime.get('global') || 0;
    const cooldownMs = config.globalSettings.cooldownBetweenAds * 60 * 1000;
    if (Date.now() - lastAdTime < cooldownMs) {
      return false;
    }

    return true;
  }

  /**
   * Gets the best ad to show for a placement
   */
  getAdForPlacement(
    placement: AdPlacement,
    context: AdContextData
  ): AdContent | null {
    if (!this.shouldShowAd(placement, context)) {
      return null;
    }

    const config = getAdConfig();
    const placementConfig = config.placements[placement];
    const allAds = getAdContent();

    // Filter ads by placement type and targeting
    const eligibleAds = allAds.filter((ad) => {
      // Check if ad type is allowed for this placement
      if (!placementConfig.adTypes.includes(ad.type)) return false;

      // Check targeting rules
      if (ad.targeting) {
        const { targeting } = ad;

        // Exclude premium users if specified
        if (targeting.excludePremium && context.isPremium) return false;

        // Check minimum days since signup
        if (
          targeting.minDaysSinceSignup &&
          context.daysSinceSignup < targeting.minDaysSinceSignup
        ) {
          return false;
        }

        // Check user segments
        if (
          targeting.userSegments &&
          context.userSegment &&
          !targeting.userSegments.includes(context.userSegment)
        ) {
          return false;
        }

        // Check daily impression limits (stored in localStorage)
        if (targeting.maxDailyImpressions) {
          const today = new Date().toDateString();
          const dailyKey = `ad_impressions_${ad.id}_${today}`;
          const dailyImpressions = parseInt(
            localStorage.getItem(dailyKey) || '0'
          );
          if (dailyImpressions >= targeting.maxDailyImpressions) {
            return false;
          }
        }
      }

      return true;
    });

    if (eligibleAds.length === 0) return null;

    // Sort by priority (higher = better) and add some randomness
    const weightedAds = eligibleAds.map((ad) => ({
      ad,
      weight: ad.priority + Math.random() * 2, // Add randomness
    }));

    weightedAds.sort((a, b) => b.weight - a.weight);

    return weightedAds[0].ad;
  }

  /**
   * Records an ad impression
   */
  recordImpression(adId: string, placement: AdPlacement): void {
    // Update session counters
    this.sessionImpressions++;
    const placementImpressions = this.sessionData.get(placement) || 0;
    this.sessionData.set(placement, placementImpressions + 1);

    // Update global ad timing
    this.lastAdTime.set('global', Date.now());

    // Update daily impression counter
    const today = new Date().toDateString();
    const dailyKey = `ad_impressions_${adId}_${today}`;
    const dailyImpressions = parseInt(localStorage.getItem(dailyKey) || '0');
    localStorage.setItem(dailyKey, (dailyImpressions + 1).toString());

    // Analytics tracking (could be extended to send to analytics service)
    this.trackEvent('ad_impression', {
      adId,
      placement,
      sessionImpressions: this.sessionImpressions,
      timeOnSite: Date.now() - this.sessionStartTime,
    });
  }

  /**
   * Records an ad click
   */
  recordClick(adId: string, placement: AdPlacement): void {
    this.trackEvent('ad_click', {
      adId,
      placement,
      sessionImpressions: this.sessionImpressions,
    });
  }

  /**
   * Records an interaction for frequency tracking
   */
  recordInteraction(placement: AdPlacement): void {
    const interactions = this.sessionData.get(`${placement}_interactions`) || 0;
    this.sessionData.set(`${placement}_interactions`, interactions + 1);
  }

  /**
   * Gets user segment based on behavior
   */
  getUserSegment(context: Partial<AdContextData>): string {
    const { sessionData, daysSinceSignup } = context;

    if (!sessionData) return 'new-user';

    // Heavy user: lots of insights generated
    if (sessionData.insightsGenerated >= 10) return 'heavy-user';

    // Engaged user: good time on site
    if (sessionData.timeOnSite > 10 * 60 * 1000) return 'engaged-user'; // 10+ minutes

    // Browser: lots of page views, few insights
    if (sessionData.pageViews >= 10 && sessionData.insightsGenerated < 3)
      return 'browser';

    // New user in first week
    if (daysSinceSignup && daysSinceSignup <= 7) return 'new-user';

    // Regular user
    return 'regular-user';
  }

  /**
   * Cleanup old data
   */
  cleanup(): void {
    // Clean up old daily impression data (keep last 7 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ad_impressions_')) {
        const datePart = key.split('_').pop();
        if (datePart && new Date(datePart) < cutoffDate) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  private trackEvent(event: string, data: Record<string, unknown>): void {
    // Basic console logging - can be extended to send to analytics service
    if (import.meta.env.DEV) {
      console.log(`[AdManager] ${event}:`, data);
    }

    // TODO: Send to analytics service
    // analytics.track(event, data);
  }
}

// Singleton instance
export const adManager = new AdManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  adManager.cleanup();
});
