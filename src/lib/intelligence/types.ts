export interface EpistemologicalBlocker {
  id: string;
  type: BlockerType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1, how confident we are this is a blocker
  patterns: DetectedPattern[];
  first_detected: Date;
  last_detected: Date;
  occurrences: number;
  user_id: string;
  block_type_ids: string[]; // Which block types this appears in
  insight_ids: number[]; // Insights where this pattern was detected
  conversation_ids: number[]; // Conversations where this pattern was detected
  recommendations: string[];
  status: 'active' | 'acknowledged' | 'resolved' | 'archived';
}

export type BlockerType =
  // Bachelard's Epistemological Obstacles
  | 'substantialist_thinking' // Seeing things as fixed essences rather than processes
  | 'obstacle_of_experience' // Over-reliance on immediate experience
  | 'verbal_obstacle' // Getting trapped in language/metaphors
  | 'unitary_knowledge' // Resistance to complexity/nuance
  | 'pragmatic_knowledge' // Immediate utility blocking deeper understanding
  | 'quantitative_obstacle' // Over-focus on measurement at expense of understanding
  | 'animistic_thinking' // Attributing agency where none exists
  | 'mythical_valorization' // Idealizing certain concepts/approaches
  | 'circular_reasoning' // Self-reinforcing thought patterns
  | 'false_precision' // Pseudo-accuracy masking uncertainty
  | 'cognitive_rigidity' // Inability to shift perspectives
  | 'avoidance_pattern' // Systematic avoidance of certain topics/approaches

  // Cognitive Bias Patterns
  | 'confirmation_bias' // Seeking information that confirms existing beliefs
  | 'dunning_kruger_effect' // Overconfidence in areas of low competence
  | 'sunk_cost_fallacy' // Continuing ineffective approaches due to past investment
  | 'choice_overload_paralysis' // Decision avoidance when overwhelmed by options

  // Attachment-Based Resistance
  | 'avoidant_attachment_block' // Discomfort with emotional vulnerability
  | 'anxious_attachment_block' // Excessive need for external validation
  | 'disorganized_attachment_block' // Chaotic engagement patterns

  // Psychological Reactance
  | 'autonomy_threat_response' // Resistance to perceived control attempts

  // Beck's Cognitive Distortions
  | 'catastrophic_thinking' // Automatically jumping to worst-case scenarios
  | 'all_or_nothing_thinking' // Inability to see gradual progress or middle ground
  | 'mental_filtering' // Focus only on negative aspects
  | 'personalization_bias'; // Taking responsibility for things outside personal control

export interface DetectedPattern {
  pattern_type: 'linguistic' | 'behavioral' | 'emotional' | 'conceptual';
  description: string;
  evidence: PatternEvidence[];
  strength: number; // 0-1
}

export interface PatternEvidence {
  source_type: 'insight' | 'chat_message' | 'user_context' | 'card_reflection';
  source_id: string;
  text_excerpt?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface IntelligenceEngineConfig {
  analysis_window_days: number;
  minimum_pattern_occurrences: number;
  confidence_threshold: number;
  enabled_blockers: BlockerType[];
  ai_model_settings: {
    temperature: number;
    max_tokens: number;
    system_prompt_version: string;
  };
}

export interface AnalysisResult {
  user_id: string;
  analysis_date: Date;
  blockers_detected: EpistemologicalBlocker[];
  analysis_summary: string;
  recommendations: string[];
  metadata: {
    insights_analyzed: number;
    conversations_analyzed: number;
    processing_time_ms: number;
    model_version: string;
  };
}
