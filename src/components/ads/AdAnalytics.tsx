import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Eye,
  MousePointer,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface AdMetrics {
  adId: string;
  title: string;
  type: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  lastShown: string;
}

export const AdAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AdMetrics[]>([]);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>(
    'today'
  );

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    // In a real implementation, this would fetch from an analytics service
    // For now, we'll simulate data from localStorage
    const mockMetrics: AdMetrics[] = [
      {
        adId: 'upgrade-premium-insights',
        title: 'Upgrade to Premium Duck',
        type: 'upgrade-prompt',
        impressions: 45,
        clicks: 8,
        ctr: 17.8,
        lastShown: '2 hours ago',
      },
      {
        adId: 'feature-block-tracking',
        title: 'Track Your Progress',
        type: 'feature-highlight',
        impressions: 32,
        clicks: 5,
        ctr: 15.6,
        lastShown: '1 hour ago',
      },
      {
        adId: 'educational-spreads',
        title: 'Did you know?',
        type: 'educational',
        impressions: 28,
        clicks: 3,
        ctr: 10.7,
        lastShown: '30 minutes ago',
      },
    ];

    setMetrics(mockMetrics);
  };

  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const avgCTR =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="bg-surface rounded-xl p-6 border border-liminal-border backdrop-blur-liminal">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-breakthrough-400" />
          <h2 className="text-xl font-bold text-primary">Ad Analytics</h2>
        </div>
        <select
          value={timeRange}
          onChange={(e) =>
            setTimeRange(e.target.value as 'today' | 'week' | 'month')
          }
          className="px-3 py-1 bg-liminal-surface border border-liminal-border rounded text-secondary text-sm"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-liminal-overlay rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-secondary">
              Impressions
            </span>
          </div>
          <p className="text-2xl font-bold text-primary">{totalImpressions}</p>
        </div>
        <div className="bg-liminal-overlay rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-secondary">Clicks</span>
          </div>
          <p className="text-2xl font-bold text-primary">{totalClicks}</p>
        </div>
        <div className="bg-liminal-overlay rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-breakthrough-400" />
            <span className="text-sm font-medium text-secondary">CTR</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {avgCTR.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Individual Ad Performance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Ad Performance</h3>
        {metrics.map((metric) => (
          <div key={metric.adId} className="bg-liminal-overlay rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-primary">{metric.title}</h4>
              <span className="text-xs px-2 py-1 bg-breakthrough-400/20 text-breakthrough-400 rounded">
                {metric.type}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-secondary">Impressions:</span>
                <p className="font-semibold text-primary">
                  {metric.impressions}
                </p>
              </div>
              <div>
                <span className="text-secondary">Clicks:</span>
                <p className="font-semibold text-primary">{metric.clicks}</p>
              </div>
              <div>
                <span className="text-secondary">CTR:</span>
                <p className="font-semibold text-primary">{metric.ctr}%</p>
              </div>
              <div>
                <span className="text-secondary">Last shown:</span>
                <p className="font-semibold text-primary">{metric.lastShown}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Link */}
      <div className="mt-6 pt-4 border-t border-liminal-border">
        <button className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors">
          <Settings className="h-4 w-4" />
          Configure Ad Settings
        </button>
      </div>
    </div>
  );
};

// Simple ad performance widget for dashboard
export const AdPerformanceWidget: React.FC = () => {
  const [stats, setStats] = useState({
    impressions: 0,
    clicks: 0,
    revenue: 0,
  });

  useEffect(() => {
    // Simulate loading stats
    setStats({
      impressions: 105,
      clicks: 16,
      revenue: 24.5,
    });
  }, []);

  const ctr =
    stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;

  return (
    <div className="bg-liminal-overlay rounded-lg p-4">
      <h3 className="text-sm font-semibold text-secondary mb-3">
        Ad Performance (Today)
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-secondary">Impressions</span>
          <span className="text-xs font-medium text-primary">
            {stats.impressions}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-secondary">Clicks</span>
          <span className="text-xs font-medium text-primary">
            {stats.clicks}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-secondary">CTR</span>
          <span className="text-xs font-medium text-primary">
            {ctr.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-secondary">Revenue</span>
          <span className="text-xs font-medium text-breakthrough-400">
            ${stats.revenue.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
