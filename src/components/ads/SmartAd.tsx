import React, { useState, useEffect } from 'react';
import type {
  AdPlacement,
  AdContextData,
  AdContent,
} from '../../lib/ads/types';
import { adManager } from '../../lib/ads/adManager';
import { BannerAd, CardAd, InterstitialAd, NativeAd } from './AdComponents';
import useAuth from '../../lib/hooks/useAuth';
import { useSessionTracker } from '../../lib/ads/sessionTracker';

interface SmartAdProps {
  placement: AdPlacement;
  className?: string;
  onAdShown?: (adId: string) => void;
  onAdClicked?: (adId: string) => void;
}

export const SmartAd: React.FC<SmartAdProps> = ({
  placement,
  className = '',
  onAdShown,
  onAdClicked,
}) => {
  const { user } = useAuth();
  const { sessionData, getUserSegment } = useSessionTracker();
  const [ad, setAd] = useState<AdContent | null>(null);
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    // Record interaction for frequency tracking
    adManager.recordInteraction(placement);

    // Build context data
    const daysSinceSignup = user?.created_at
      ? Math.floor(
          (Date.now() - new Date(user.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const context: AdContextData = {
      userId: user?.id,
      sessionId: sessionStorage.getItem('ad_session_id') || 'anonymous',
      placement,
      isPremium: user?.premium || false,
      daysSinceSignup,
      sessionData,
      userSegment: getUserSegment(),
    };

    // Get ad for this placement
    const selectedAd = adManager.getAdForPlacement(placement, context);

    if (selectedAd) {
      setAd(selectedAd);

      // Handle interstitial ads
      if (selectedAd.variant === 'interstitial') {
        setShowInterstitial(true);
      }

      onAdShown?.(selectedAd.id);
    }
  }, [placement, user, sessionData, onAdShown, getUserSegment]);

  if (!ad) {
    return null;
  }

  const handleAdClick = () => {
    onAdClicked?.(ad.id);
  };

  const handleInterstitialClose = () => {
    setShowInterstitial(false);
    setAd(null);
  };

  // Render interstitial ads
  if (ad.variant === 'interstitial' && showInterstitial) {
    return (
      <InterstitialAd
        ad={ad}
        placement={placement}
        onClick={handleAdClick}
        onClose={handleInterstitialClose}
      />
    );
  }

  // Don't render interstitial ads that aren't showing
  if (ad.variant === 'interstitial' && !showInterstitial) {
    return null;
  }

  // Render other ad types
  const adProps = {
    ad,
    placement,
    onClick: handleAdClick,
  };

  return (
    <div className={className}>
      {ad.variant === 'banner' && <BannerAd {...adProps} />}
      {ad.variant === 'card' && <CardAd {...adProps} />}
      {ad.variant === 'native' && <NativeAd {...adProps} />}
    </div>
  );
};

// Convenience components for specific placements
export const InsightAd: React.FC<Omit<SmartAdProps, 'placement'>> = (props) => (
  <SmartAd {...props} placement="insight-footer" />
);

export const DashboardAd: React.FC<Omit<SmartAdProps, 'placement'>> = (
  props
) => <SmartAd {...props} placement="dashboard-header" />;

export const BlocksAd: React.FC<Omit<SmartAdProps, 'placement'>> = (props) => (
  <SmartAd {...props} placement="blocks-list" />
);

export const CardDetailAd: React.FC<Omit<SmartAdProps, 'placement'>> = (
  props
) => <SmartAd {...props} placement="card-detail" />;

export const NativeContentAd: React.FC<Omit<SmartAdProps, 'placement'>> = (
  props
) => <SmartAd {...props} placement="native-content" />;

// Hook for triggering interstitial ads programmatically
export const useInterstitialAd = () => {
  const [showAd, setShowAd] = useState(false);
  const { user } = useAuth();
  const { sessionData, getUserSegment } = useSessionTracker();

  const triggerInterstitial = (triggerContext?: {
    sessionData?: typeof sessionData;
  }) => {
    const daysSinceSignup = user?.created_at
      ? Math.floor(
          (Date.now() - new Date(user.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const context: AdContextData = {
      userId: user?.id,
      sessionId: sessionStorage.getItem('ad_session_id') || 'anonymous',
      placement: 'interstitial',
      isPremium: user?.premium || false,
      daysSinceSignup,
      sessionData: triggerContext?.sessionData || sessionData,
      userSegment: getUserSegment(),
    };

    const ad = adManager.getAdForPlacement('interstitial', context);
    if (ad && ad.variant === 'interstitial') {
      setShowAd(true);
      return ad;
    }
    return null;
  };

  return {
    triggerInterstitial,
    showAd,
    closeAd: () => setShowAd(false),
  };
};
