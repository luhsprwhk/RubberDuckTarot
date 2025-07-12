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
  // Defensive check for null/undefined insights array
  if (!insights || !Array.isArray(insights) || insights.length === 0) {
    return 'No previous insights with positive feedback yet.';
  }

  // Only include insights that resonated or where user took action
  // Add defensive checks for null insights and missing properties
  const relevantInsights = insights.filter((insight) => {
    if (!insight || typeof insight !== 'object') {
      return false;
    }
    return Boolean(insight.resonated) || Boolean(insight.took_action);
  });

  if (relevantInsights.length === 0) {
    return 'No previous insights with positive feedback yet.';
  }

  return relevantInsights
    .map((insight, index) => {
      // Defensive check for insight object and created_at
      if (!insight || typeof insight !== 'object') {
        return `${index + 1}. Invalid insight data`;
      }

      // Safe date handling with fallback
      let timeAgo = 'Unknown date';
      try {
        if (insight.created_at) {
          const date = new Date(insight.created_at);
          if (!isNaN(date.getTime())) {
            timeAgo = date.toLocaleDateString();
          }
        }
      } catch (error) {
        console.warn('Invalid date in insight:', insight.created_at, error);
      }

      // Safe feedback array construction
      const feedback = [];
      if (insight.resonated === true) feedback.push('resonated');
      if (insight.took_action === true) feedback.push('took action');

      // Defensive reading data access
      const reading = insight.reading as PersonalizedReading;

      // Safe key insights extraction with multiple fallbacks
      let keyInsights: string[] = [];
      try {
        if (reading && typeof reading === 'object' && reading.keyInsights) {
          if (Array.isArray(reading.keyInsights)) {
            keyInsights = reading.keyInsights.filter(
              (insight) => insight && typeof insight === 'string'
            );
          }
        }
      } catch (error) {
        console.warn('Error accessing keyInsights:', error);
      }

      // Safe interpretation extraction with null checks
      let interpretation = '';
      try {
        if (reading && typeof reading === 'object' && reading.interpretation) {
          interpretation = String(reading.interpretation).trim();
        }
      } catch (error) {
        console.warn('Error accessing interpretation:', error);
      }

      // Build the insight string with defensive formatting
      const feedbackStr =
        feedback.length > 0 ? feedback.join(', ') : 'positive feedback';
      const keyInsightsStr =
        keyInsights.length > 0 ? `Key Insights: ${keyInsights.join(', ')}` : '';

      let interpretationStr = '';
      if (interpretation) {
        // Safe substring with bounds checking
        const maxLength = 200;
        if (interpretation.length > maxLength) {
          interpretationStr = `Rob's Take: ${interpretation.substring(0, maxLength)}...`;
        } else {
          interpretationStr = `Rob's Take: ${interpretation}`;
        }
      }

      // Construct the final string with safe joins
      const parts = [
        `${index + 1}. ${timeAgo} (${feedbackStr}):`,
        keyInsightsStr,
        interpretationStr,
      ].filter((part) => part.trim() !== '');

      return parts.join('\n   ');
    })
    .filter((entry) => entry && entry.trim() !== '') // Remove any empty entries
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
    // Defensive parameter validation
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('Invalid user message provided');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }

    if (!userBlock || typeof userBlock !== 'object') {
      throw new Error('Invalid user block data provided');
    }

    if (!blockType || typeof blockType !== 'object') {
      throw new Error('Invalid block type data provided');
    }

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
    // Defensive access to blockType.name
    const blockTypeName = blockType?.name
      ? String(blockType.name).toLowerCase()
      : 'general';
    const contextMetaphors = getContextMetaphors({
      creative_identity: 'general',
      work_context: blockTypeName,
    });

    // Trim conversation history to recent messages for context
    // Defensive check for conversation history
    const safeConversationHistory = Array.isArray(conversationHistory)
      ? conversationHistory
      : [];
    const recentHistory = safeConversationHistory
      .filter(
        (msg) => msg && typeof msg === 'object' && msg.role && msg.content
      ) // Filter out invalid messages
      .slice(-6) // Keep last 6 messages for context
      .map((msg) => ({
        role: String(msg.role),
        content: String(msg.content),
      }));

    // Format relevant insights with defensive array check
    const safeBlockInsights = Array.isArray(blockInsights) ? blockInsights : [];
    const relevantInsights = formatRelevantInsights(safeBlockInsights);

    // Build the prompt for block discussion with defensive data access
    const blockName = userBlock?.name
      ? String(userBlock.name)
      : 'Unnamed Block';
    const blockTypeNameDisplay = blockType?.name
      ? String(blockType.name)
      : 'General';
    const blockTypeEmoji = blockType?.emoji ? String(blockType.emoji) : '🎯';
    const blockStatus = userBlock?.status
      ? String(userBlock.status)
      : 'unknown';
    const blockNotes = userBlock?.notes
      ? String(userBlock.notes)
      : 'No notes yet';

    // Safe date handling for created_at
    let createdDate = 'Unknown date';
    try {
      if (userBlock?.created_at) {
        const date = new Date(userBlock.created_at);
        if (!isNaN(date.getTime())) {
          createdDate = date.toLocaleDateString();
        }
      }
    } catch (error) {
      console.warn(
        'Invalid created_at date in userBlock:',
        userBlock?.created_at,
        error
      );
    }

    // Safe context metaphors access
    const metaphorStyle = contextMetaphors?.style
      ? String(contextMetaphors.style)
      : 'General advice approach';
    const metaphorNote = contextMetaphors?.note
      ? String(contextMetaphors.note)
      : '';

    // Safe conversation history formatting
    const conversationHistoryStr =
      recentHistory.length > 0
        ? recentHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n')
        : '';

    const prompt = `You are Rob, a wise and experienced consultant helping someone work through a personal block they're tracking. Here's the context:

BLOCK DETAILS:
- Block Name: "${blockName}"
- Block Category: ${blockTypeNameDisplay} (${blockTypeEmoji})
- Block Status: ${blockStatus}
- Block Notes: ${blockNotes}
- Created: ${createdDate}

RELEVANT PAST INSIGHTS (only insights that resonated or where user took action):
${relevantInsights}

CONTEXT METAPHORS (use these to make advice more relatable):
${metaphorStyle}${metaphorNote ? ` - ${metaphorNote}` : ''}

CONVERSATION HISTORY:
${conversationHistoryStr}

USER'S CURRENT MESSAGE: "${userMessage.trim()}"

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

    // Re-throw validation errors as-is
    if (error instanceof Error && error.message.includes('Invalid')) {
      throw error;
    }

    console.error('Block chat generation error:', error);
    throw new Error('Failed to generate block chat response');
  }
}
