import React, { useState, useEffect, useCallback } from 'react';
import { IntelligenceEngine } from '../lib/intelligence/intelligence-engine';
import {
  DEFAULT_INTELLIGENCE_CONFIG,
  BLOCKER_DESCRIPTIONS,
  SEVERITY_CONFIG,
} from '../lib/intelligence/config';
import type {
  EpistemologicalBlocker,
  AnalysisResult,
} from '../lib/intelligence/types';

interface IntelligenceDashboardProps {
  userId?: string;
  isAdminView?: boolean;
}

export const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({
  userId,
  isAdminView = false,
}) => {
  const [engine] = useState(
    () => new IntelligenceEngine(DEFAULT_INTELLIGENCE_CONFIG)
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [blockers, setBlockers] = useState<EpistemologicalBlocker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlocker, setSelectedBlocker] =
    useState<EpistemologicalBlocker | null>(null);

  useEffect(() => {
    if (userId) {
      loadAnalysisData();
    }
  }, [userId, loadAnalysisData]);

  const loadAnalysisData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [result] = await Promise.all([
        engine.analyzeUser(userId),
        engine.getAnalysisHistory(userId, 1),
      ]);

      setAnalysisResult(result);
      setBlockers(result.blockers_detected);
    } catch {
      setError('Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [userId, engine]);

  const updateBlockerStatus = async (
    blockerId: string,
    status: EpistemologicalBlocker['status'],
    notes?: string
  ) => {
    try {
      await engine.updateBlockerStatus(blockerId, status, notes);

      // Update local state
      setBlockers((prev) =>
        prev.map((blocker) =>
          blocker.id === blockerId ? { ...blocker, status } : blocker
        )
      );
    } catch {
      setError('Failed to update blocker status');
    }
  };

  const BlockerCard: React.FC<{ blocker: EpistemologicalBlocker }> = ({
    blocker,
  }) => {
    const config = BLOCKER_DESCRIPTIONS[blocker.type];
    const severityConfig = SEVERITY_CONFIG[blocker.severity];

    return (
      <div
        className={`border-l-4 border-${severityConfig.color}-500 bg-white p-4 rounded-r-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
        onClick={() => setSelectedBlocker(blocker)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{config.icon}</span>
              <h3 className="font-semibold text-gray-900">{config.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded bg-${severityConfig.color}-100 text-${severityConfig.color}-800`}
              >
                {blocker.severity}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{blocker.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Confidence: {Math.round(blocker.confidence * 100)}%</span>
              <span>Occurrences: {blocker.occurrences}</span>
              <span>Status: {blocker.status}</span>
            </div>
          </div>
          {isAdminView && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateBlockerStatus(blocker.id, 'acknowledged');
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                disabled={blocker.status === 'acknowledged'}
              >
                Acknowledge
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateBlockerStatus(blocker.id, 'resolved');
                }}
                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                disabled={blocker.status === 'resolved'}
              >
                Resolve
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const BlockerDetailModal: React.FC = () => {
    if (!selectedBlocker) return null;

    const config = BLOCKER_DESCRIPTIONS[selectedBlocker.type];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">{config.icon}</span>
                {config.name}
              </h2>
              <button
                onClick={() => setSelectedBlocker(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{selectedBlocker.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Detected Patterns</h3>
                <div className="space-y-2">
                  {selectedBlocker.patterns.map((pattern, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p className="text-sm">{pattern.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Evidence: {pattern.evidence.length} instance(s) |
                        Strength: {Math.round(pattern.strength * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedBlocker.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">First Detected:</span>
                  <br />
                  {new Date(
                    selectedBlocker.first_detected
                  ).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Last Detected:</span>
                  <br />
                  {new Date(selectedBlocker.last_detected).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Block Types:</span>
                  <br />
                  {selectedBlocker.block_type_ids.join(', ')}
                </div>
                <div>
                  <span className="font-semibold">Related Insights:</span>
                  <br />
                  {selectedBlocker.insight_ids.length} insights
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing cognitive patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">Analysis Error</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadAnalysisData}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-2xl font-bold mb-4">
          {isAdminView
            ? "Intelligence Analysis - Rob's Dashboard"
            : 'Cognitive Patterns Analysis'}
        </h2>

        {analysisResult && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Analysis Summary</h3>
            <p className="text-gray-700 mb-4">
              {analysisResult.analysis_summary}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold">Insights Analyzed:</span>
                <br />
                {analysisResult.metadata.insights_analyzed}
              </div>
              <div>
                <span className="font-semibold">Conversations:</span>
                <br />
                {analysisResult.metadata.conversations_analyzed}
              </div>
              <div>
                <span className="font-semibold">Processing Time:</span>
                <br />
                {Math.round(analysisResult.metadata.processing_time_ms / 1000)}s
              </div>
              <div>
                <span className="font-semibold">Analysis Date:</span>
                <br />
                {new Date(analysisResult.analysis_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {blockers.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Detected Epistemological Blockers ({blockers.length})
          </h3>
          <div className="space-y-3">
            {blockers
              .sort(
                (a, b) =>
                  SEVERITY_CONFIG[b.severity].priority -
                  SEVERITY_CONFIG[a.severity].priority
              )
              .map((blocker) => (
                <BlockerCard key={blocker.id} blocker={blocker} />
              ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-semibold text-green-800 mb-2">
            No Significant Blockers Detected
          </h3>
          <p className="text-green-700">
            This user shows healthy cognitive flexibility and openness to
            growth.
          </p>
        </div>
      )}

      {analysisResult && analysisResult.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-4">
            Overall Recommendations
          </h3>
          <ul className="list-disc list-inside space-y-2">
            {analysisResult.recommendations.map((rec, index) => (
              <li key={index} className="text-blue-700">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <BlockerDetailModal />
    </div>
  );
};
