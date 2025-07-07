import React from 'react';
import { Link } from 'react-router-dom';
import type { AdContent, AdPlacement } from '../../lib/ads/types';
import { adManager } from '../../lib/ads/adManager';
import { ExternalLink, Star, Zap, BookOpen, TrendingUp } from 'lucide-react';

interface AdComponentProps {
  ad: AdContent;
  placement: AdPlacement;
  onImpression?: () => void;
  onClick?: () => void;
}

// Banner Ad Component
export const BannerAd: React.FC<AdComponentProps> = ({
  ad,
  placement,
  onImpression,
  onClick,
}) => {
  React.useEffect(() => {
    onImpression?.();
    adManager.recordImpression(ad.id, placement);
  }, [ad.id, placement, onImpression]);

  const handleClick = () => {
    onClick?.();
    adManager.recordClick(ad.id, placement);
  };

  const getIcon = () => {
    switch (ad.type) {
      case 'upgrade-prompt':
        return <Zap className="h-4 w-4" />;
      case 'feature-highlight':
        return <Star className="h-4 w-4" />;
      case 'educational':
        return <BookOpen className="h-4 w-4" />;
      case 'social-proof':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const content = (
    <div
      className="bg-liminal-surface border border-liminal-border rounded-lg p-4 text-center hover:border-breakthrough-400/50 transition-colors cursor-pointer group"
      onClick={handleClick}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        {getIcon()}
        <p className="text-secondary text-sm font-medium">{ad.title}</p>
      </div>
      <p className="text-xs text-secondary/70 mb-3">{ad.description}</p>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-breakthrough-400 group-hover:text-breakthrough-300 transition-colors">
        {ad.ctaText}
        <ExternalLink className="h-3 w-3" />
      </span>
    </div>
  );

  if (ad.ctaLink) {
    return (
      <Link to={ad.ctaLink} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
};

// Card Ad Component
export const CardAd: React.FC<AdComponentProps> = ({
  ad,
  placement,
  onImpression,
  onClick,
}) => {
  React.useEffect(() => {
    onImpression?.();
    adManager.recordImpression(ad.id, placement);
  }, [ad.id, placement, onImpression]);

  const handleClick = () => {
    onClick?.();
    adManager.recordClick(ad.id, placement);
  };

  const getTypeColor = () => {
    switch (ad.type) {
      case 'upgrade-prompt':
        return 'border-breakthrough-400/50 bg-breakthrough-50/5';
      case 'feature-highlight':
        return 'border-accent/50 bg-accent/5';
      case 'educational':
        return 'border-blue-400/50 bg-blue-50/5';
      case 'social-proof':
        return 'border-green-400/50 bg-green-50/5';
      default:
        return 'border-liminal-border bg-liminal-surface';
    }
  };

  const content = (
    <div
      className={`rounded-xl p-6 border backdrop-blur-liminal hover:shadow-glow transition-all cursor-pointer group ${getTypeColor()}`}
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold text-primary mb-3 group-hover:text-breakthrough-400 transition-colors">
        {ad.title}
      </h3>
      <p className="text-secondary mb-4 leading-relaxed">{ad.description}</p>
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-breakthrough-400 text-void-900 font-semibold rounded-lg hover:bg-breakthrough-300 transition-colors text-sm">
          {ad.ctaText}
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </div>
  );

  if (ad.ctaLink) {
    return (
      <Link to={ad.ctaLink} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
};

// Interstitial Ad Component (full-screen overlay)
export const InterstitialAd: React.FC<
  AdComponentProps & { onClose: () => void }
> = ({ ad, placement, onImpression, onClick, onClose }) => {
  React.useEffect(() => {
    onImpression?.();
    adManager.recordImpression(ad.id, placement);
  }, [ad.id, placement, onImpression]);

  const handleClick = () => {
    onClick?.();
    adManager.recordClick(ad.id, placement);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-void-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full border border-liminal-border shadow-glow">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">{ad.title}</h2>
          <p className="text-secondary mb-6 leading-relaxed">
            {ad.description}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClick}
              className="flex-1 bg-breakthrough-400 text-void-900 font-semibold py-3 px-6 rounded-lg hover:bg-breakthrough-300 transition-colors"
            >
              {ad.ctaText}
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-3 text-secondary hover:text-primary transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Native Ad Component (blends with content)
export const NativeAd: React.FC<AdComponentProps> = ({
  ad,
  placement,
  onImpression,
  onClick,
}) => {
  React.useEffect(() => {
    onImpression?.();
    adManager.recordImpression(ad.id, placement);
  }, [ad.id, placement, onImpression]);

  const handleClick = () => {
    onClick?.();
    adManager.recordClick(ad.id, placement);
  };

  const content = (
    <div
      className="bg-liminal-overlay rounded-lg p-4 cursor-pointer group border-l-4 border-breakthrough-400/50"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-2 h-2 bg-breakthrough-400 rounded-full"></div>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-primary mb-1 group-hover:text-breakthrough-400 transition-colors">
            {ad.title}
          </h4>
          <p className="text-xs text-secondary mb-2">{ad.description}</p>
          <span className="text-xs text-breakthrough-400 font-medium">
            {ad.ctaText} →
          </span>
        </div>
      </div>
    </div>
  );

  if (ad.ctaLink) {
    return (
      <Link to={ad.ctaLink} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
};
