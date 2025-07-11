import { anthropic } from './index';
import systemPrompt from './system-prompt.md?raw';
import type { PersonalizedReading } from './index';
import type { BlockType, UserProfile } from '@/src/interfaces';
import {
  rateLimiter,
  RateLimitError,
  createRateLimitMessage,
} from '../lib/rate-limiter';
import { sanitizeUserProfile } from '../lib/ai-prompt-sanitization';
import { getContextMetaphors } from './profession-metaphors';

// Chat message validation constants
export const CHAT_MESSAGE_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 1000,
  MAX_LINES: 10,
} as const;

// Validation function for chat messages
export const validateChatMessage = (
  message: string
): { isValid: boolean; error?: string } => {
  const trimmed = message.trim();

  if (trimmed.length < CHAT_MESSAGE_LIMITS.MIN_LENGTH) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > CHAT_MESSAGE_LIMITS.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Message must be ${CHAT_MESSAGE_LIMITS.MAX_LENGTH} characters or less`,
    };
  }

  const lineCount = trimmed.split('\n').length;
  if (lineCount > CHAT_MESSAGE_LIMITS.MAX_LINES) {
    return {
      isValid: false,
      error: `Message must be ${CHAT_MESSAGE_LIMITS.MAX_LINES} lines or less`,
    };
  }

  return { isValid: true };
};

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
  userProfile?: UserProfile;
}

export const generateInsightChat = async (
  request: ChatRequest
): Promise<string> => {
  try {
    // Validate message length
    const validation = validateChatMessage(request.userMessage);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid message format');
    }

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
      model: import.meta.env.VITE_ANTHROPIC_MODEL,
      max_tokens: 1000,
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
    userProfile,
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

  // Format user profile context if available
  let userProfileContext = '';
  if (userProfile) {
    const sanitizedProfile = sanitizeUserProfile(userProfile);

    // Get context-specific metaphor style
    const metaphorStyle = getContextMetaphors({
      creative_identity: sanitizedProfile.creative_identity,
      work_context: sanitizedProfile.work_context,
    });

    userProfileContext = `
<client_profile>
Name: ${sanitizedProfile.name}
Creative Identity: ${sanitizedProfile.creative_identity}
Work Context: ${sanitizedProfile.work_context} - ${metaphorStyle.note}
Debugging Style: ${sanitizedProfile.debugging_mode}
Primary Block Pattern: ${sanitizedProfile.block_pattern}
Superpower: "${sanitizedProfile.superpower}"
Kryptonite: "${sanitizedProfile.kryptonite}"
Problem-solving Spirit: ${sanitizedProfile.spirit_animal}
Zodiac Sign: ${sanitizedProfile.zodiac_sign}
</client_profile>
`;
  }

  const prompt = `${userProfileContext}
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
${userProfile ? `- Remember their profile: ${userProfile.name} is a ${userProfile.creative_identity} who works in ${userProfile.work_context}. Their debugging style is ${userProfile.debugging_mode}, their superpower is "${userProfile.superpower}", and their kryptonite is "${userProfile.kryptonite}. Their zodiac sign is ${userProfile.zodiac_sign} and debugging spirit animal is ${userProfile.spirit_animal}. Tailor your language and metaphors accordingly.` : ''}
- Use appropriate metaphors based on their work context and creative identity
- Reference their strengths and challenges from their profile naturally

Respond as Rob would in a natural conversation, not as a formal reading.
</chat_instructions>

Rob:`;

  return prompt;
};
