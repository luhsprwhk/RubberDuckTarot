import { anthropic } from './index';
import systemPrompt from './system-prompt.md?raw';
import type { UserBlock, BlockType, Insight } from '@/src/interfaces';
import type { PersonalizedReading } from './index';
import {
  rateLimiter,
  RateLimitError,
  createRateLimitMessage,
} from '../lib/rate-limiter';
import { getContextMetaphors } from './profession-metaphors';

// Re-export constants and functions from insight chat for consistency
export {
  CHAT_MESSAGE_LIMITS,
  CONVERSATION_LIMITS,
  validateChatMessage,
  cleanupOldMessages,
  trimMessageHistory,
} from './generate_insight_chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GenerateBlockChatParams {
  userMessage: string;
  conversationHistory: Message[];
  userBlock: UserBlock;
  blockType: BlockType;
  userId: string;
  blockInsights?: Insight[];
}

const formatRelevantInsights = (insights: Insight[]): string => {
  if (!insights || insights.length === 0) {
    return 'No previous insights with positive feedback yet.';
  }

  // Only include insights that resonated or where user took action
  const relevantInsights = insights.filter(
    (insight) => insight.resonated || insight.took_action
  );

  if (relevantInsights.length === 0) {
    return 'No previous insights with positive feedback yet.';
  }

  return relevantInsights
    .map((insight, index) => {
      const timeAgo = new Date(insight.created_at).toLocaleDateString();
      const feedback = [];
      if (insight.resonated) feedback.push('resonated');
      if (insight.took_action) feedback.push('took action');

      const reading = insight.reading as PersonalizedReading;
      const keyInsights = Array.isArray(reading?.keyInsights)
        ? reading.keyInsights
        : [];
      const interpretation = reading?.interpretation || '';

      return `${index + 1}. ${timeAgo} (${feedback.join(', ')}):
   ${keyInsights.length > 0 ? `Key Insights: ${keyInsights.join(', ')}` : ''}
   ${interpretation ? `Rob's Take: ${interpretation.substring(0, 200)}${interpretation.length > 200 ? '...' : ''}` : ''}`;
    })
    .join('\n\n');
};

export async function generateBlockChat({
  userMessage,
  conversationHistory,
  userBlock,
  blockType,
  userId,
  blockInsights = [],
}: GenerateBlockChatParams): Promise<string> {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiter.checkLimit(
      userId,
      'generateBlockChat',
      600 // Estimated tokens for block chat
    );
    if (!rateLimitResult.allowed) {
      const message = createRateLimitMessage(
        'generateBlockChat',
        rateLimitResult
      );
      throw new RateLimitError(
        message,
        rateLimitResult.retryAfter || 0,
        rateLimitResult.resetTime || Date.now(),
        rateLimitResult.remainingRequests || 0
      );
    }

    // Get context metaphors for more relatable language - use block type as fallback context
    const contextMetaphors = getContextMetaphors({
      creative_identity: 'general',
      work_context: blockType.name.toLowerCase(),
    });

    // Trim conversation history to recent messages for context
    const recentHistory = conversationHistory
      .slice(-6) // Keep last 6 messages for context
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Format relevant insights
    const relevantInsights = formatRelevantInsights(blockInsights);

    // Build the prompt for block discussion
    const prompt = `You are Rob, a wise and experienced consultant helping someone work through a personal block they're tracking. Here's the context:

BLOCK DETAILS:
- Block Name: "${userBlock.name}"
- Block Category: ${blockType.name} (${blockType.emoji})
- Block Status: ${userBlock.status}
- Block Notes: ${userBlock.notes || 'No notes yet'}
- Created: ${new Date(userBlock.created_at).toLocaleDateString()}

RELEVANT PAST INSIGHTS (only insights that resonated or where user took action):
${relevantInsights}

CONTEXT METAPHORS (use these to make advice more relatable):
${contextMetaphors.style} - ${contextMetaphors.note}

CONVERSATION HISTORY:
${recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}

USER'S CURRENT MESSAGE: "${userMessage}"

Respond as Rob with practical, empathetic advice about this block. Focus on:
1. Understanding the specific situation they're dealing with
2. Building on insights that previously resonated or led to action
3. Providing actionable strategies for working through the block
4. Using metaphors from their context when helpful
5. Being encouraging but realistic
6. Asking thoughtful follow-up questions when appropriate

Keep your response conversational, insightful, and under 300 words. Don't repeat the block details they already know.`;

    const model =
      import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    const response = await anthropic.messages.create({
      model,
      max_tokens: 500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude API');
    }

    return content.text.trim();
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }

    console.error('Block chat generation error:', error);
    throw new Error('Failed to generate block chat response');
  }
}
