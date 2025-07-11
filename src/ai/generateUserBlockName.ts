/**
 * Generates a concise, personalized title for a user's block tracker entry.
 * @param blockTypeName - The type of the block (e.g., "Personal Challenge").
 * @param userContext - The user's current context or challenge.
 * @returns A personalized, actionable block name.
 */

import { anthropic } from './index';
import { sanitizeUserContext } from '../lib/ai-prompt-sanitization';
import {
  rateLimiter,
  RateLimitError,
  createRateLimitMessage,
} from '../lib/rate-limiter';

export const generateUserBlockName = async (
  blockTypeName?: string,
  userContext?: string,
  userId?: string
): Promise<string> => {
  try {
    // Check rate limit before processing
    const rateLimitResult = await rateLimiter.checkLimit(
      userId || 'anonymous',
      'generateUserBlockName',
      50 // estimated tokens
    );

    if (!rateLimitResult.allowed) {
      const message = createRateLimitMessage(
        'generateUserBlockName',
        rateLimitResult
      );
      throw new RateLimitError(
        message,
        rateLimitResult.retryAfter || 0,
        rateLimitResult.resetTime,
        rateLimitResult.remainingRequests
      );
    }
    // Sanitize user-provided context
    const sanitizedContext = sanitizeUserContext(userContext);

    const prompt = `You are helping create a personalized name for a user's block tracker entry.

Block Type: ${blockTypeName || 'Personal Challenge'}
User Context: ${sanitizedContext || 'Working on personal growth'}

Generate a concise, personalized title (2-6 words) that captures the essence of this specific block. Make it actionable and personal. Examples:
- "Breaking Through Creative Paralysis"
- "Overcoming Perfectionism Trap"
- "Building Confidence Muscle"
- "Releasing Control Anxiety"

Just return the title, nothing else.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      temperature: 0.8,
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

    return response.text.trim().replace(/^"|"$/g, ''); // Remove quotes if present
  } catch (error) {
    console.error('Failed to generate block name:', error);
    // Fallback to a generic name
    return `${blockTypeName || 'Personal'} Block`;
  }
};
