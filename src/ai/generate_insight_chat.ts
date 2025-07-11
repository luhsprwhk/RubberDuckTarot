import { anthropic } from './index';
import systemPrompt from './system-prompt.md?raw';
import type { PersonalizedReading } from './index';
import type { BlockType } from '@/src/interfaces';
import {
  rateLimiter,
  RateLimitError,
  createRateLimitMessage,
} from '../lib/rate-limiter';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  userMessage: string;
  conversationHistory: Message[];
  originalReading: PersonalizedReading;
  blockType: BlockType | null;
  userContext: string;
  drawnCards: Array<{ name: string; emoji: string; reversed?: boolean }>;
  userId: string;
}

export const generateInsightChat = async (
  request: ChatRequest
): Promise<string> => {
  try {
    // Check rate limit
    const rateLimitResult = await rateLimiter.checkLimit(
      request.userId,
      'generateInsightChat',
      400 // Smaller token limit for chat messages
    );

    if (!rateLimitResult.allowed) {
      const message = createRateLimitMessage(
        'generateInsightChat',
        rateLimitResult
      );
      throw new RateLimitError(
        message,
        rateLimitResult.retryAfter || 0,
        rateLimitResult.resetTime,
        rateLimitResult.remainingRequests
      );
    }

    const prompt = buildChatPrompt(request);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      temperature: 0.8, // Slightly more creative for conversation
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0];
    if (response.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return response.text.trim();
  } catch (error) {
    console.error('Failed to generate chat response:', error);
    throw new Error('Unable to generate response. Please try again.');
  }
};

const buildChatPrompt = (request: ChatRequest): string => {
  const {
    userMessage,
    conversationHistory,
    originalReading,
    blockType,
    userContext,
    drawnCards,
  } = request;

  // Format conversation history
  const chatHistory = conversationHistory
    .slice(-6) // Keep last 6 messages for context
    .map((msg) => `${msg.role === 'user' ? 'Human' : 'Rob'}: ${msg.content}`)
    .join('\n');

  // Format drawn cards
  const cardsInfo = drawnCards
    .map(
      (card) =>
        `${card.emoji} ${card.name}${card.reversed ? ' (Reversed)' : ''}`
    )
    .join(', ');

  const prompt = `
<original_consultation>
Block Type: ${blockType?.name || 'General'}
User's Situation: "${userContext}"
Cards Drawn: ${cardsInfo}

Original Reading:
- Interpretation: ${originalReading.interpretation}
- Key Insights: ${originalReading.keyInsights.join('; ')}
- Action Steps: ${originalReading.actionSteps.join('; ')}
- Rob's Quip: "${originalReading.robQuip}"
- Reflection Prompts: ${originalReading.reflectionPrompts?.join('; ') || 'None'}
</original_consultation>

<conversation_history>
${chatHistory}
</conversation_history>

<current_message>
Human: ${userMessage}
</current_message>

<chat_instructions>
You are Rob Chen, continuing the conversation about this specific tarot reading. The human wants to dig deeper into the insights you already provided.

Key guidelines:
- Stay in character as Rob: blunt, helpful, uses tech metaphors, deadpan humor
- Reference the original reading naturally - you remember what you said
- Build on your previous insights rather than repeating them
- Ask probing questions to help them debug their thinking
- Keep responses conversational and relatively brief (2-3 sentences max)
- Focus on practical application and next steps
- Challenge assumptions and mental blocks
- Use the cards as reference points when relevant
- Be supportive but push them forward

Respond as Rob would in a natural conversation, not as a formal reading.
</chat_instructions>

Rob:`;

  return prompt;
};
