// Session tracking utilities for ad targeting

class SessionTracker {
  private startTime: number;
  private pageViews: number;
  private insightsGenerated: number;

  constructor() {
    this.startTime = this.getOrSetStartTime();
    this.pageViews = this.getPageViews();
    this.insightsGenerated = this.getInsightsGenerated();

    // Initialize session on first load
    this.init();
  }

  private init() {
    // Set session ID if not exists
    if (!sessionStorage.getItem('ad_session_id')) {
      sessionStorage.setItem('ad_session_id', this.generateSessionId());
    }

    // Track page view
    this.trackPageView();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getOrSetStartTime(): number {
    const stored = sessionStorage.getItem('session_start');
    if (stored) {
      return parseInt(stored);
    }
    const now = Date.now();
    sessionStorage.setItem('session_start', now.toString());
    return now;
  }

  private getPageViews(): number {
    const stored = sessionStorage.getItem('page_views');
    return stored ? parseInt(stored) : 0;
  }

  private getInsightsGenerated(): number {
    const stored = sessionStorage.getItem('insights_generated');
    return stored ? parseInt(stored) : 0;
  }

  trackPageView(): void {
    this.pageViews += 1;
    sessionStorage.setItem('page_views', this.pageViews.toString());
  }

  trackInsightGenerated(): void {
    this.insightsGenerated += 1;
    sessionStorage.setItem(
      'insights_generated',
      this.insightsGenerated.toString()
    );
  }

  trackInteraction(type: string, data?: Record<string, unknown>): void {
    const interactions = this.getInteractions();
    interactions.push({
      type,
      timestamp: Date.now(),
      data,
    });

    // Keep only last 50 interactions
    if (interactions.length > 50) {
      interactions.splice(0, interactions.length - 50);
    }

    sessionStorage.setItem('interactions', JSON.stringify(interactions));
  }

  private getInteractions(): Array<{
    type: string;
    timestamp: number;
    data?: Record<string, unknown>;
  }> {
    const stored = sessionStorage.getItem('interactions');
    return stored ? JSON.parse(stored) : [];
  }

  getSessionData() {
    return {
      sessionId: sessionStorage.getItem('ad_session_id') || 'unknown',
      pageViews: this.pageViews,
      insightsGenerated: this.insightsGenerated,
      timeOnSite: Date.now() - this.startTime,
      interactions: this.getInteractions(),
    };
  }

  // Get simplified session data for ad targeting
  getAdTargetingData() {
    return {
      pageViews: this.pageViews,
      insightsGenerated: this.insightsGenerated,
      timeOnSite: Date.now() - this.startTime,
    };
  }

  // Clear session data (useful for testing)
  clearSession(): void {
    sessionStorage.removeItem('ad_session_id');
    sessionStorage.removeItem('session_start');
    sessionStorage.removeItem('page_views');
    sessionStorage.removeItem('insights_generated');
    sessionStorage.removeItem('interactions');

    // Reinitialize
    this.startTime = this.getOrSetStartTime();
    this.pageViews = 0;
    this.insightsGenerated = 0;
    this.init();
  }

  // Analytics helper methods
  getEngagementScore(): number {
    const timeMinutes = (Date.now() - this.startTime) / (1000 * 60);
    const pageViewsPerMinute =
      timeMinutes > 0 ? this.pageViews / timeMinutes : 0;
    const insightsPerPageView =
      this.pageViews > 0 ? this.insightsGenerated / this.pageViews : 0;

    // Simple engagement score calculation
    return Math.min(
      100,
      pageViewsPerMinute * 10 + insightsPerPageView * 50 + timeMinutes * 2
    );
  }

  getUserBehaviorSegment(): string {
    const timeMinutes = (Date.now() - this.startTime) / (1000 * 60);
    const engagementScore = this.getEngagementScore();

    if (this.insightsGenerated >= 5) return 'power-user';
    if (this.insightsGenerated >= 2 && timeMinutes >= 10) return 'engaged-user';
    if (this.pageViews >= 5 && this.insightsGenerated === 0) return 'browser';
    if (timeMinutes < 2) return 'new-visitor';
    if (engagementScore > 50) return 'active-user';

    return 'casual-user';
  }
}

// Singleton instance
export const sessionTracker = new SessionTracker();

// Utility functions for components
export const useSessionData = () => sessionTracker.getAdTargetingData();

export const trackPageView = () => sessionTracker.trackPageView();
export const trackInsightGenerated = () =>
  sessionTracker.trackInsightGenerated();
export const trackInteraction = (
  type: string,
  data?: Record<string, unknown>
) => sessionTracker.trackInteraction(type, data);

// Hook for React components
export const useSessionTracker = () => {
  return {
    sessionData: sessionTracker.getAdTargetingData(),
    trackPageView: () => sessionTracker.trackPageView(),
    trackInsightGenerated: () => sessionTracker.trackInsightGenerated(),
    trackInteraction: (type: string, data?: Record<string, unknown>) =>
      sessionTracker.trackInteraction(type, data),
    getUserSegment: () => sessionTracker.getUserBehaviorSegment(),
    getEngagementScore: () => sessionTracker.getEngagementScore(),
  };
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  // Could send final analytics data here
  sessionTracker.trackInteraction('page_unload', {
    finalSessionData: sessionTracker.getSessionData(),
  });
});
