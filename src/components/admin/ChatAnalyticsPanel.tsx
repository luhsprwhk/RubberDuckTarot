import { useState, useEffect, useCallback } from 'react';
import {
  FaDownload,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import {
  InsightImprovementService,
  type SystemInsightReport,
} from '@/src/lib/analytics/insight-improvement';
import { cn } from '@/src/lib/utils';

interface ChatAnalyticsPanelProps {
  className?: string;
}

export default function ChatAnalyticsPanel({
  className,
}: ChatAnalyticsPanelProps) {
  const [report, setReport] = useState<SystemInsightReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newReport =
        await InsightImprovementService.generateSystemReport(timeframe);
      setReport(newReport);
    } catch (err) {
      setError('Failed to load analytics report');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  const exportData = async () => {
    try {
      const csvData =
        await InsightImprovementService.exportAnalyticsData(timeframe);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-analytics-${timeframe}d-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
      console.error('Export error:', err);
    }
  };

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up' || trend === 'positive' || trend === 'increasing') {
      return <span className="text-green-600">↗️</span>;
    }
    if (trend === 'down' || trend === 'negative' || trend === 'decreasing') {
      return <span className="text-red-600">↘️</span>;
    }
    return <span className="text-gray-600">→</span>;
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-lg p-6', className)}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Chat Analytics Dashboard
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button
            onClick={loadReport}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <FaSyncAlt className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            <FaDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading analytics...</div>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">
                Effectiveness Score
              </div>
              <div
                className={cn(
                  'text-2xl font-bold',
                  getScoreColor(report.effectivenessScore)
                )}
              >
                {report.effectivenessScore}%
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">
                User Engagement
              </div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {getTrendIcon(report.trends.userEngagement)}
                {report.trends.userEngagement}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 text-sm font-medium">
                Sentiment Trend
              </div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {getTrendIcon(report.trends.sentimentTrend)}
                {report.trends.sentimentTrend}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-600 text-sm font-medium">
                Conversation Length
              </div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {getTrendIcon(report.trends.conversationLength)}
                {report.trends.conversationLength}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Priority Recommendations
            </h3>
            <div className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded border-l-4',
                    rec.priority === 'high' && 'bg-red-50 border-red-500',
                    rec.priority === 'medium' &&
                      'bg-yellow-50 border-yellow-500',
                    rec.priority === 'low' && 'bg-blue-50 border-blue-500'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {rec.priority === 'high' && (
                      <FaExclamationTriangle className="text-red-500" />
                    )}
                    {rec.priority === 'medium' && (
                      <FaExclamationTriangle className="text-yellow-500" />
                    )}
                    {rec.priority === 'low' && (
                      <FaCheckCircle className="text-blue-500" />
                    )}
                    <span className="font-medium">{rec.category}</span>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded',
                        rec.priority === 'high' && 'bg-red-200 text-red-800',
                        rec.priority === 'medium' &&
                          'bg-yellow-200 text-yellow-800',
                        rec.priority === 'low' && 'bg-blue-200 text-blue-800'
                      )}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    {rec.description}
                  </div>
                  <div className="text-xs text-gray-600">
                    {rec.implementation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Action Items</h3>
            <ul className="space-y-2">
              {report.actionItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span
                    className={cn(
                      'text-sm',
                      item.startsWith('URGENT:') && 'font-bold text-red-600'
                    )}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Report Metadata */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div>Report generated: {report.timestamp.toLocaleString()}</div>
            <div>Timeframe: {report.timeframe}</div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600">
          No data available. Click refresh to load analytics.
        </div>
      )}
    </div>
  );
}
