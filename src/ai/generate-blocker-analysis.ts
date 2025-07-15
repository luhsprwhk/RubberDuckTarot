import Anthropic from '@anthropic-ai/sdk';
import type {
  BlockerType,
  DetectedPattern,
  IntelligenceEngineConfig,
} from '../lib/intelligence/types';

interface InsightData {
  user_context?: string;
  reading: { summary?: string } | string;
  resonated: boolean;
  took_action: boolean;
  block_type_id: string;
  cards_drawn?: { id: number; reversed: boolean }[];
}

interface ConversationData {
  messages?: { role: string; content: string }[];
  last_message_at?: string;
}

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

interface BlockerAnalysisInput {
  blockerType: BlockerType;
  insights: InsightData[];
  conversations: ConversationData[];
  config: IntelligenceEngineConfig;
}

interface BlockerAnalysisOutput {
  detected: boolean;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  patterns: DetectedPattern[];
  occurrences: number;
  block_type_ids: string[];
  insight_ids: number[];
  conversation_ids: number[];
  recommendations: string[];
}

const BLOCKER_PROMPTS: Record<BlockerType, string> = {
  substantialist_thinking: `
    Analyze for SUBSTANTIALIST THINKING - treating dynamic processes as fixed essences.
    Look for:
    - Describing problems as inherent personality traits rather than learnable skills
    - "I'm just not a creative person" vs "I haven't developed creative skills yet"
    - Fixed mindset language about abilities, relationships, or situations
    - Resistance to seeing things as changeable or contextual
  `,

  obstacle_of_experience: `
    Analyze for OBSTACLE OF EXPERIENCE - over-reliance on immediate, unreflected experience.
    Look for:
    - Dismissing insights that don't match immediate past experience
    - "This has never worked for me before" blocking new approaches
    - Inability to abstract beyond personal anecdotes
    - Resistance to trying new methods due to past failures
  `,

  verbal_obstacle: `
    Analyze for VERBAL OBSTACLE - getting trapped in language, metaphors, or terminology.
    Look for:
    - Overuse of vague metaphors that obscure actual understanding
    - Getting stuck in debates about definitions rather than solutions
    - Using buzzwords or jargon to avoid deeper analysis
    - Metaphorical thinking that prevents literal action
  `,

  unitary_knowledge: `
    Analyze for UNITARY KNOWLEDGE - resistance to complexity and nuance.
    Look for:
    - Seeking simple, one-size-fits-all solutions to complex problems
    - Discomfort with paradox or contradiction
    - "Just tell me what to do" avoiding personal reflection
    - Resistance to context-dependent or situational advice
  `,

  pragmatic_knowledge: `
    Analyze for PRAGMATIC KNOWLEDGE - immediate utility blocking deeper understanding.
    Look for:
    - Only valuing insights that provide immediate, actionable steps
    - Impatience with reflection or pattern recognition
    - Dismissing systemic thinking for quick fixes
    - "What's the point?" when faced with foundational questions
  `,

  quantitative_obstacle: `
    Analyze for QUANTITATIVE OBSTACLE - over-focus on measurement at expense of understanding.
    Look for:
    - Obsession with metrics, rankings, or numerical progress
    - Inability to value qualitative improvements
    - "How do I measure if this is working?" for inherently qualitative growth
    - Reducing complex growth to simple scores or timelines
  `,

  animistic_thinking: `
    Analyze for ANIMISTIC THINKING - attributing agency where none exists.
    Look for:
    - Blaming external forces for internal blocks ("The universe is against me")
    - Treating systems or tools as having intentions
    - Expecting magic solutions from tarot rather than self-reflection
    - Personifying abstract concepts in ways that reduce agency
  `,

  mythical_valorization: `
    Analyze for MYTHICAL VALORIZATION - idealizing certain concepts or approaches.
    Look for:
    - Putting methods, people, or ideas on pedestals
    - "If only I could be like [idealized person]"
    - Seeking perfect systems or approaches
    - Resistance to criticism of favored methods or gurus
  `,

  circular_reasoning: `
    Analyze for CIRCULAR REASONING - self-reinforcing thought patterns.
    Look for:
    - Using problems to justify avoiding solutions to those problems
    - "I can't do X because I'm bad at X" loops
    - Seeking evidence that confirms existing beliefs about limitations
    - Avoiding challenges that might disprove negative self-concepts
  `,

  false_precision: `
    Analyze for FALSE PRECISION - pseudo-accuracy masking uncertainty.
    Look for:
    - Overspecific plans that avoid acknowledging uncertainty
    - "I need to know exactly what will happen before I try"
    - Using precise-sounding language to avoid deeper uncertainty
    - Demanding guarantees in inherently uncertain domains
  `,

  cognitive_rigidity: `
    Analyze for COGNITIVE RIGIDITY - inability to shift perspectives.
    Look for:
    - Strong attachment to particular interpretations of situations
    - Difficulty considering alternative viewpoints
    - "That's just how I am" as response to change suggestions
    - Resistance to reframing problems in new ways
  `,

  avoidance_pattern: `
    Analyze for AVOIDANCE PATTERNS - systematic avoidance of certain topics or approaches.
    Look for:
    - Consistently steering away from specific themes or topics
    - "I don't want to talk about that" for growth-related areas
    - Pattern of engaging with surface issues while avoiding deeper ones
    - Deflection through humor, intellectualization, or topic changes
  `,

  // Cognitive Bias Patterns
  confirmation_bias: `
    Analyze for CONFIRMATION BIAS - seeking information that confirms existing beliefs.
    Look for:
    - Only resonating with insights that confirm current self-concept
    - "This doesn't apply to me" responses to challenging readings
    - Selective engagement with parts of readings that support existing views
    - Dismissing cards or interpretations that contradict established beliefs
    - Pattern of asking for new readings when results don't match expectations
  `,

  dunning_kruger_effect: `
    Analyze for DUNNING-KRUGER EFFECT - overconfidence in areas of low competence.
    Look for:
    - "I already know this" responses to valuable insights
    - Quick dismissal of advice without genuine consideration
    - Overestimating current understanding or skill level
    - Minimal engagement with reflection questions
    - Resistance to beginner-friendly approaches despite lack of progress
  `,

  sunk_cost_fallacy: `
    Analyze for SUNK COST FALLACY - continuing ineffective approaches due to past investment.
    Look for:
    - "I've been doing this for years" as justification for maintaining ineffective patterns
    - Persistence with strategies that aren't working
    - Resistance to trying new approaches because of time already invested
    - Focusing on past effort rather than current effectiveness
    - Difficulty abandoning methods that once worked but no longer serve
  `,

  choice_overload_paralysis: `
    Analyze for CHOICE OVERLOAD PARALYSIS - decision avoidance when overwhelmed by options.
    Look for:
    - "Just tell me what to do" in response to multi-faceted readings
    - Requests for simpler answers when given nuanced insights
    - Paralysis when presented with multiple valid approaches
    - Difficulty prioritizing among several good options
    - Seeking single "right" answer to complex situations
  `,

  // Attachment-Based Resistance
  avoidant_attachment_block: `
    Analyze for AVOIDANT ATTACHMENT BLOCK - discomfort with emotional vulnerability.
    Look for:
    - Surface-level engagement, deflection from emotional content
    - Preferring practical over emotional insights
    - Avoiding personal context sharing
    - Preferring "quick-draw" over deeper, more vulnerable spreads
    - Discomfort when readings touch on relationships or emotional needs
    - Minimizing the importance of emotional factors
  `,

  anxious_attachment_block: `
    Analyze for ANXIOUS ATTACHMENT BLOCK - excessive need for external validation.
    Look for:
    - "Are you sure this is right?" patterns seeking confirmation
    - Repeated requests for similar readings for reassurance
    - Inability to trust own interpretation of insights
    - Seeking multiple confirmations before taking action
    - Self-doubt despite clear, resonant readings
    - Difficulty accepting positive insights about self-capability
  `,

  disorganized_attachment_block: `
    Analyze for DISORGANIZED ATTACHMENT BLOCK - chaotic engagement patterns.
    Look for:
    - Hot/cold cycles in chat interactions
    - Deep engagement followed by complete withdrawal
    - Contradictory responses to similar situations
    - Alternating between over-sharing and shutting down
    - Inconsistent patterns of insight resonance
    - Conflicting desires for both closeness and distance
  `,

  // Psychological Reactance
  autonomy_threat_response: `
    Analyze for AUTONOMY THREAT RESPONSE - resistance to perceived control attempts.
    Look for:
    - "Don't tell me what to do" responses to direct suggestions
    - Pushback against clear recommendations
    - Boomerang effects where opposite actions are taken
    - Resistance triggered by directive language
    - Preference for discovering solutions independently
    - Contrarian patterns in following advice
  `,

  // Beck's Cognitive Distortions
  catastrophic_thinking: `
    Analyze for CATASTROPHIC THINKING - automatically jumping to worst-case scenarios.
    Look for:
    - Interpreting neutral or mildly challenging cards as disasters
    - "This means everything will go wrong" responses to balanced readings
    - Focus on worst possible outcomes rather than likely scenarios
    - Magnifying potential problems while minimizing coping abilities
    - Difficulty seeing gradual or manageable challenges
  `,

  all_or_nothing_thinking: `
    Analyze for ALL-OR-NOTHING THINKING - inability to see gradual progress or middle ground.
    Look for:
    - "If I can't do it perfectly, why try?" patterns
    - Dismissing partial success as failure
    - Seeking perfect solutions to complex problems
    - Black-and-white interpretations of nuanced readings
    - Difficulty appreciating incremental progress
    - Either/or framing of situations with multiple possibilities
  `,

  mental_filtering: `
    Analyze for MENTAL FILTERING - focusing only on negative aspects while ignoring positive.
    Look for:
    - Exclusively discussing challenging parts of readings
    - Cherry-picking negative interpretations from balanced insights
    - Chat conversations that ignore supportive messages
    - Fixation on problems while dismissing strengths or opportunities
    - Pattern of remembering only difficult aspects of previous readings
  `,

  personalization_bias: `
    Analyze for PERSONALIZATION BIAS - taking responsibility for things outside personal control.
    Look for:
    - "It's all my fault" responses to systemic or external challenges
    - Interpreting situational cards as personal failings
    - Taking blame for others' actions or choices
    - Feeling responsible for outcomes beyond their influence
    - Difficulty distinguishing between personal agency and external factors
  `,
};

export async function generateBlockerAnalysis(
  input: BlockerAnalysisInput
): Promise<BlockerAnalysisOutput> {
  try {
    const prompt = buildAnalysisPrompt(input);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: input.config.ai_model_settings.max_tokens || 2000,
      temperature: input.config.ai_model_settings.temperature || 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const analysisText =
      response.content[0].type === 'text' ? response.content[0].text : '';
    return parseAnalysisResponse(analysisText, input);
  } catch (error) {
    console.error('Failed to generate blocker analysis:', error);
    throw new Error('AI analysis failed');
  }
}

function buildAnalysisPrompt(input: BlockerAnalysisInput): string {
  const { blockerType, insights, conversations } = input;

  return `
You are an expert in epistemological analysis, specifically trained in Gaston Bachelard's theory of epistemological obstacles. Analyze the provided user data for signs of the following cognitive blocker:

${BLOCKER_PROMPTS[blockerType]}

ANALYSIS DATA:
Recent Insights (${insights.length} total):
${insights
  .slice(0, 5)
  .map(
    (insight) => `
- Block Type: ${insight.block_type_id}
- User Context: ${insight.user_context || 'None provided'}
- Cards: ${insight.cards_drawn?.map((c) => `${c.id}${c.reversed ? ' (reversed)' : ''}`).join(', ')}
- Resonated: ${insight.resonated ? 'Yes' : 'No'}
- Took Action: ${insight.took_action ? 'Yes' : 'No'}
- Reading Summary: ${typeof insight.reading === 'object' ? JSON.stringify(insight.reading).slice(0, 200) + '...' : insight.reading}
`
  )
  .join('\n')}

Recent Conversations (${conversations.length} total):
${conversations
  .slice(0, 3)
  .map(
    (conv) => `
- Messages: ${conv.messages?.length || 0}
- Last active: ${conv.last_message_at}
- Sample messages: ${
      conv.messages
        ?.slice(0, 3)
        .map((m) => `${m.role}: ${m.content.slice(0, 100)}...`)
        .join(' | ') || 'No messages'
    }
`
  )
  .join('\n')}

ANALYSIS INSTRUCTIONS:
1. Look for patterns that match the specific epistemological obstacle described above
2. Consider both explicit statements and implicit patterns of thinking
3. Assess the frequency and consistency of the pattern
4. Evaluate the severity of how this blocks the user's growth

REQUIRED JSON RESPONSE FORMAT:
{
  "detected": boolean,
  "confidence": number (0-1),
  "severity": "low" | "medium" | "high" | "critical",
  "title": "Brief descriptive title",
  "description": "Detailed explanation of the detected pattern",
  "evidence": [
    {
      "source": "insight_id or conversation_id",
      "excerpt": "relevant text showing the pattern",
      "explanation": "why this shows the obstacle"
    }
  ],
  "occurrences": number,
  "recommendations": ["specific recommendations to address this obstacle"],
  "block_type_ids": ["block types where this pattern appears"],
  "insight_ids": [relevant insight IDs],
  "conversation_ids": [relevant conversation IDs]
}

Focus on quality over quantity - only detect patterns that genuinely match Bachelard's epistemological obstacles and would meaningfully impact the user's growth.
`;
}

function parseAnalysisResponse(
  response: string,
  input: BlockerAnalysisInput
): BlockerAnalysisOutput {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      detected?: boolean;
      confidence?: number;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      title?: string;
      description?: string;
      evidence?: Array<{
        source: string;
        excerpt: string;
        explanation: string;
      }>;
      occurrences?: number;
      recommendations?: string[];
      block_type_ids?: string[];
      insight_ids?: number[];
      conversation_ids?: number[];
    };

    // Convert evidence to DetectedPattern format
    const patterns: DetectedPattern[] =
      parsed.evidence?.map((ev) => ({
        pattern_type: 'conceptual' as const,
        description: ev.explanation,
        evidence: [
          {
            source_type: ev.source.includes('insight')
              ? ('insight' as const)
              : ('chat_message' as const),
            source_id: ev.source,
            text_excerpt: ev.excerpt,
            timestamp: new Date(),
          },
        ],
        strength: parsed.confidence || 0.5,
      })) || [];

    return {
      detected: parsed.detected || false,
      title: parsed.title || `${input.blockerType} detected`,
      description: parsed.description || 'No description provided',
      severity: parsed.severity || 'medium',
      confidence: parsed.confidence || 0.5,
      patterns,
      occurrences: parsed.occurrences || 1,
      block_type_ids: parsed.block_type_ids || [],
      insight_ids: parsed.insight_ids || [],
      conversation_ids: parsed.conversation_ids || [],
      recommendations: parsed.recommendations || [],
    };
  } catch (error) {
    console.error('Failed to parse analysis response:', error);
    return {
      detected: false,
      title: 'Analysis failed',
      description: 'Could not parse AI response',
      severity: 'low',
      confidence: 0,
      patterns: [],
      occurrences: 0,
      block_type_ids: [],
      insight_ids: [],
      conversation_ids: [],
      recommendations: ['Retry analysis with better data'],
    };
  }
}
