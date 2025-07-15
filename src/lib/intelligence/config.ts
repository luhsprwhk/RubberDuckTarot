import type { IntelligenceEngineConfig, BlockerType } from './types';

export const DEFAULT_INTELLIGENCE_CONFIG: IntelligenceEngineConfig = {
  analysis_window_days: 30,
  minimum_pattern_occurrences: 2,
  confidence_threshold: 0.6,
  enabled_blockers: [
    // Core Bachelard blockers
    'substantialist_thinking',
    'obstacle_of_experience',
    'verbal_obstacle',
    'unitary_knowledge',
    'pragmatic_knowledge',
    'circular_reasoning',
    'cognitive_rigidity',
    'avoidance_pattern',

    // High-value cognitive bias blockers
    'confirmation_bias',
    'all_or_nothing_thinking',
    'mental_filtering',

    // Critical attachment patterns
    'avoidant_attachment_block',
    'anxious_attachment_block',

    // Common therapeutic resistance
    'autonomy_threat_response',
  ] as BlockerType[],
  ai_model_settings: {
    temperature: 0.3,
    max_tokens: 2000,
    system_prompt_version: 'v1.0.0',
  },
};

export const BLOCKER_DESCRIPTIONS: Record<
  BlockerType,
  { name: string; description: string; icon: string }
> = {
  substantialist_thinking: {
    name: 'Fixed Mindset',
    description:
      'Treating dynamic processes as unchangeable traits or essences',
    icon: '🧱',
  },
  obstacle_of_experience: {
    name: 'Past-Bound Thinking',
    description:
      'Over-reliance on immediate past experience blocking new approaches',
    icon: '⏪',
  },
  verbal_obstacle: {
    name: 'Language Traps',
    description: 'Getting stuck in metaphors or terminology instead of action',
    icon: '🗣️',
  },
  unitary_knowledge: {
    name: 'Simplicity Bias',
    description: 'Resistance to complexity and nuanced understanding',
    icon: '🎯',
  },
  pragmatic_knowledge: {
    name: 'Quick Fix Seeking',
    description: 'Immediate utility blocking deeper foundational understanding',
    icon: '⚡',
  },
  quantitative_obstacle: {
    name: 'Measurement Obsession',
    description: 'Over-focus on metrics at expense of qualitative growth',
    icon: '📊',
  },
  animistic_thinking: {
    name: 'External Attribution',
    description: 'Attributing personal agency to external forces or systems',
    icon: '🌟',
  },
  mythical_valorization: {
    name: 'Idealization Patterns',
    description: 'Putting methods, people, or approaches on pedestals',
    icon: '⭐',
  },
  circular_reasoning: {
    name: 'Thought Loops',
    description: 'Self-reinforcing patterns that maintain problems',
    icon: '🔄',
  },
  false_precision: {
    name: 'Certainty Demands',
    description: 'Pseudo-accuracy masking comfort with uncertainty',
    icon: '🎯',
  },
  cognitive_rigidity: {
    name: 'Perspective Lock',
    description: 'Difficulty shifting viewpoints or reframing problems',
    icon: '🔒',
  },
  avoidance_pattern: {
    name: 'Systematic Avoidance',
    description: 'Consistent steering away from growth-related topics',
    icon: '🙈',
  },

  // Cognitive Bias Patterns
  confirmation_bias: {
    name: 'Confirmation Bias',
    description: 'Seeking only information that confirms existing beliefs',
    icon: '✅',
  },
  dunning_kruger_effect: {
    name: 'Overconfidence Block',
    description: 'Overestimating competence in areas of low skill',
    icon: '🧠',
  },
  sunk_cost_fallacy: {
    name: 'Sunk Cost Trap',
    description: 'Continuing ineffective approaches due to past investment',
    icon: '⛳',
  },
  choice_overload_paralysis: {
    name: 'Choice Paralysis',
    description: 'Decision avoidance when overwhelmed by options',
    icon: '🤹',
  },

  // Attachment-Based Resistance
  avoidant_attachment_block: {
    name: 'Emotional Avoidance',
    description: 'Discomfort with vulnerability and deep emotional content',
    icon: '🛡️',
  },
  anxious_attachment_block: {
    name: 'Validation Seeking',
    description: 'Excessive need for external confirmation and reassurance',
    icon: '🤝',
  },
  disorganized_attachment_block: {
    name: 'Chaotic Patterns',
    description: 'Inconsistent cycles of engagement and withdrawal',
    icon: '🌪️',
  },

  // Psychological Reactance
  autonomy_threat_response: {
    name: 'Control Resistance',
    description: 'Pushback against perceived attempts to direct behavior',
    icon: '⚡',
  },

  // Beck's Cognitive Distortions
  catastrophic_thinking: {
    name: 'Catastrophizing',
    description: 'Automatically jumping to worst-case scenarios',
    icon: '💥',
  },
  all_or_nothing_thinking: {
    name: 'Black & White Thinking',
    description: 'Inability to see gradual progress or middle ground',
    icon: '⚫',
  },
  mental_filtering: {
    name: 'Negative Filter',
    description: 'Focusing only on problems while ignoring positives',
    icon: '🔍',
  },
  personalization_bias: {
    name: 'Self-Blame Pattern',
    description: 'Taking responsibility for things outside personal control',
    icon: '👤',
  },
};

export const SEVERITY_CONFIG = {
  low: { color: 'green', priority: 1, description: 'Minor impact on growth' },
  medium: {
    color: 'yellow',
    priority: 2,
    description: 'Moderate growth limitation',
  },
  high: {
    color: 'orange',
    priority: 3,
    description: 'Significant obstacle to progress',
  },
  critical: {
    color: 'red',
    priority: 4,
    description: 'Severely blocking advancement',
  },
};
