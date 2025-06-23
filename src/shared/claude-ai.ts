import Anthropic from '@anthropic-ai/sdk';
import type { UserProfile } from './userPreferences';
import type { Card, BlockType } from './interfaces';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ReadingRequest {
  cards: Card[];
  blockType: BlockType;
  userContext: string;
  userProfile: UserProfile;
  spreadType: 'quick-draw' | 'full-pond';
}

export interface PersonalizedReading {
  interpretation: string;
  keyInsights: string[];
  actionSteps: string[];
  robQuip: string;
}

export const generatePersonalizedReading = async (
  request: ReadingRequest
): Promise<PersonalizedReading> => {
  try {
    const prompt = buildReadingPrompt(request);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
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

    return parseReadingResponse(response.text);
  } catch (error) {
    console.error('Failed to generate personalized reading:', error);
    throw new Error('Unable to generate reading. Please try again.');
  }
};

const buildReadingPrompt = (request: ReadingRequest): string => {
  const { cards, blockType, userContext, userProfile, spreadType } = request;

  const cardDetails = cards
    .map((card) => {
      const blockId = blockType.id as keyof typeof card.block_applications;
      return (
        `${card.emoji} ${card.name}: ${card.duck_question}\n` +
        `Core meaning: ${card.block_applications[blockId] || 'General guidance needed'}\n` +
        `Duck wisdom: ${card.duck_wisdom}`
      );
    })
    .join('\n\n');

  return `You are Rob, a dead developer stuck in a rubber duck who provides debugging advice for life problems. You're sarcastic but helpful, using programming metaphors while keeping things practical.

USER PROFILE:
- Name: ${userProfile.name}
- Profession: ${userProfile.profession}
- Debugging Style: ${userProfile.debugging_mode}
- Primary Block: ${userProfile.block_pattern}
- Superpower: ${userProfile.superpower}
- Kryptonite: ${userProfile.kryptonite}
- Spirit Animal: ${userProfile.spirit_animal}

READING TYPE: ${spreadType} spread for ${blockType.name} blocks
USER'S SITUATION: ${userContext}

CARDS DRAWN:
${cardDetails}

Generate a personalized reading that:
1. Combines the cards meaningfully for their specific situation
2. References their profile (profession, debugging style, superpower/kryptonite)
3. Provides actionable advice in Rob's voice
4. Uses programming metaphors appropriate to their profession level

Format as JSON:
{
  "interpretation": "Main reading combining all cards for their situation",
  "keyInsights": ["3-4 key insights as bullet points"],
  "actionSteps": ["2-3 specific actionable steps"],
  "robQuip": "A sarcastic but encouraging closing remark from Rob"
}`;
};

const parseReadingResponse = (response: string): PersonalizedReading => {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);
    return {
      interpretation: parsed.interpretation || '',
      keyInsights: parsed.keyInsights || [],
      actionSteps: parsed.actionSteps || [],
      robQuip: parsed.robQuip || '',
    };
  } catch {
    // Fallback: treat as plain text interpretation
    return {
      interpretation: response,
      keyInsights: [],
      actionSteps: [],
      robQuip:
        "Well, that's all the wisdom I can squeeze out of this ethereal rubber duck form. Now go debug your life.",
    };
  }
};
