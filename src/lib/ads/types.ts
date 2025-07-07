// Ad system types and interfaces

export type AdPlacement =
  | 'insight-reading' // After insight reading
  | 'insight-footer' // Bottom of insight display
  | 'dashboard-header' // Top of dashboard
  | 'blocks-list' // In blocks listing
  | 'card-detail' // On card detail pages
  | 'interstitial' // Full-screen between actions
  | 'native-content'; // Embedded in content

export type AdType =
  | 'upgrade-prompt' // Encourage premium upgrade
  | 'partner-content' // Partner/affiliate content
  | 'feature-highlight' // Highlight app features
  | 'social-proof' // User testimonials/reviews
  | 'educational'; // Tips, tutorials, etc.

export type AdVariant = 'banner' | 'card' | 'interstitial' | 'native';

export interface AdContent {
  id: string;
  type: AdType;
  variant: AdVariant;
  title: string;
  description: string;
  ctaText: string;
  ctaLink?: string;
  ctaAction?: () => void;
  image?: string;
  priority: number; // Higher = more likely to show
  active: boolean;
  targeting?: {
    userSegments?: string[];
    maxDailyImpressions?: number;
    minDaysSinceSignup?: number;
    excludePremium?: boolean;
  };
}

export interface AdConfig {
  placements: Record<
    AdPlacement,
    {
      enabled: boolean;
      frequency: number; // Show every N interactions
      maxPerSession: number;
      adTypes: AdType[];
    }
  >;
  globalSettings: {
    respectDoNotTrack: boolean;
    maxAdsPerSession: number;
    cooldownBetweenAds: number; // minutes
  };
}

export interface AdAnalytics {
  impressions: number;
  clicks: number;
  conversions: number;
  lastShown: Date;
  sessionImpressions: number;
}

export interface AdContextData {
  userId?: string;
  sessionId: string;
  placement: AdPlacement;
  userSegment?: string;
  isPremium: boolean;
  daysSinceSignup: number;
  sessionData: {
    pageViews: number;
    insightsGenerated: number;
    timeOnSite: number;
  };
}
