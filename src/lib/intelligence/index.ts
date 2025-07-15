// Intelligence Engine Public API
export { IntelligenceEngine } from './intelligence-engine';
export {
  DEFAULT_INTELLIGENCE_CONFIG,
  BLOCKER_DESCRIPTIONS,
  SEVERITY_CONFIG,
} from './config';
export type {
  EpistemologicalBlocker,
  DetectedPattern,
  PatternEvidence,
  BlockerType,
  AnalysisResult,
  IntelligenceEngineConfig,
} from './types';

// Convenience function for quick analysis
export async function analyzeUserBlockers(
  userId: string,
  config = DEFAULT_INTELLIGENCE_CONFIG
) {
  const engine = new IntelligenceEngine(config);
  return engine.analyzeUser(userId);
}

// Rob's admin helpers
export async function getBlockerStatusSummary() {
  // This would query all users' blockers for admin overview
  // Implementation would go here
  return {
    total_users_analyzed: 0,
    active_blockers: 0,
    resolved_blockers: 0,
    critical_blockers: 0,
  };
}
