import React from 'react';
import { InsightAd } from './ads/SmartAd';

interface AdBannerProps {
  className?: string;
}

// Legacy AdBanner component - now uses the smart ad system
const AdBanner: React.FC<AdBannerProps> = ({ className }) => {
  return <InsightAd className={className} />;
};

export default AdBanner;
