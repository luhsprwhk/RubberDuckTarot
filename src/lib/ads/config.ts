import type { AdConfig, AdContent } from './types';

// Default ad configuration
export const DEFAULT_AD_CONFIG: AdConfig = {
  placements: {
    'insight-reading': {
      enabled: true,
      frequency: 1, // Show on every reading
      maxPerSession: 2,
      adTypes: ['upgrade-prompt', 'feature-highlight'],
    },
    'insight-footer': {
      enabled: true,
      frequency: 1,
      maxPerSession: 3,
      adTypes: ['upgrade-prompt', 'social-proof', 'educational'],
    },
    'dashboard-header': {
      enabled: true,
      frequency: 3, // Show every 3rd visit
      maxPerSession: 1,
      adTypes: ['feature-highlight', 'partner-content'],
    },
    'blocks-list': {
      enabled: true,
      frequency: 2, // Show every 2nd visit
      maxPerSession: 1,
      adTypes: ['upgrade-prompt', 'educational'],
    },
    'card-detail': {
      enabled: true,
      frequency: 5, // Show every 5th card view
      maxPerSession: 1,
      adTypes: ['educational', 'partner-content'],
    },
    interstitial: {
      enabled: false, // Disabled by default - can be intrusive
      frequency: 10,
      maxPerSession: 1,
      adTypes: ['upgrade-prompt'],
    },
    'native-content': {
      enabled: true,
      frequency: 1,
      maxPerSession: 2,
      adTypes: ['feature-highlight', 'educational'],
    },
  },
  globalSettings: {
    respectDoNotTrack: true,
    maxAdsPerSession: 5,
    cooldownBetweenAds: 2, // 2 minutes between ads
  },
};

// Default ad content library
export const DEFAULT_AD_CONTENT: AdContent[] = [
  {
    id: 'upgrade-premium-insights',
    type: 'upgrade-prompt',
    variant: 'banner',
    title: '🦆 Upgrade to Premium Duck',
    description:
      'Get unlimited insights, advanced spreads, and ad-free wisdom from Rob.',
    ctaText: 'Upgrade Now',
    ctaLink: '/upgrade',
    priority: 10,
    active: true,
    targeting: {
      excludePremium: true,
      minDaysSinceSignup: 1,
      maxDailyImpressions: 3,
    },
  },
  {
    id: 'feature-block-tracking',
    type: 'feature-highlight',
    variant: 'card',
    title: '📊 Track Your Progress',
    description:
      'Use block tracking to monitor your personal growth and breakthroughs.',
    ctaText: 'Learn More',
    ctaLink: '/features',
    priority: 7,
    active: true,
    targeting: {
      maxDailyImpressions: 2,
    },
  },
  {
    id: 'social-proof-testimonial',
    type: 'social-proof',
    variant: 'card',
    title: '💭 "Rob\'s insights changed my perspective"',
    description:
      'Join thousands of users finding clarity through Rubber Duck Tarot.',
    ctaText: 'Read Reviews',
    ctaLink: '/reviews',
    priority: 5,
    active: true,
    targeting: {
      minDaysSinceSignup: 7,
      maxDailyImpressions: 1,
    },
  },
  {
    id: 'educational-spreads',
    type: 'educational',
    variant: 'banner',
    title: '📚 Did you know?',
    description:
      'Quick Draw readings are perfect for daily guidance, while Full Pond spreads dive deeper into complex situations.',
    ctaText: 'Explore Spreads',
    ctaLink: '/features#spreads',
    priority: 6,
    active: true,
    targeting: {
      maxDailyImpressions: 2,
    },
  },
  {
    id: 'upgrade-unlimited',
    type: 'upgrade-prompt',
    variant: 'interstitial',
    title: '🚀 Ready for Unlimited Wisdom?',
    description:
      "You've generated several insights! Upgrade to Premium for unlimited access and exclusive features.",
    ctaText: 'Go Premium',
    ctaLink: '/pricing',
    priority: 9,
    active: true,
    targeting: {
      excludePremium: true,
      minDaysSinceSignup: 3,
      maxDailyImpressions: 1,
      userSegments: ['heavy-user'],
    },
  },
  {
    id: 'feature-sentiment-tracking',
    type: 'feature-highlight',
    variant: 'native',
    title: '🎯 Track What Resonates',
    description:
      'Use the sentiment tracking to remember which insights led to real action.',
    ctaText: 'Try It Now',
    priority: 4,
    active: true,
    targeting: {
      maxDailyImpressions: 1,
    },
  },
];

// Environment-based overrides
export function getAdConfig(): AdConfig {
  const isDev = import.meta.env.DEV;
  const disableAds = import.meta.env.VITE_DISABLE_ADS === 'true';

  if (disableAds) {
    // Disable all ads
    const config = { ...DEFAULT_AD_CONFIG };
    Object.keys(config.placements).forEach((placement) => {
      config.placements[placement as keyof typeof config.placements].enabled =
        false;
    });
    return config;
  }

  if (isDev) {
    // In development, show ads more frequently for testing
    const config = { ...DEFAULT_AD_CONFIG };
    Object.keys(config.placements).forEach((placement) => {
      config.placements[placement as keyof typeof config.placements].frequency =
        1;
    });
    return config;
  }

  return DEFAULT_AD_CONFIG;
}

export function getAdContent(): AdContent[] {
  const disableAds = import.meta.env.VITE_DISABLE_ADS === 'true';

  if (disableAds) {
    return [];
  }

  return DEFAULT_AD_CONTENT.filter((ad) => ad.active);
}
