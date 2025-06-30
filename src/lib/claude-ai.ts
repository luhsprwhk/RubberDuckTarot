import Anthropic from '@anthropic-ai/sdk';
import type { UserProfile } from '../interfaces';
import type { Card, BlockType } from '../interfaces';
import { getProfessionMetaphors } from './ai/profession-metaphors';
import systemPrompt from './ai/system-prompt.md?raw';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ReadingRequest {
  cards: (Card & { reversed: boolean })[];
  blockType: BlockType;
  userContext: string;
  userProfile: UserProfile;
  spreadType: 'quick-draw' | 'duck-insight' | 'full-pond';
}

export interface PersonalizedReading {
  interpretation: string;
  keyInsights: string[];
  actionSteps: string[];
  robQuip: string;
  reflectionPrompts?: string[]; // For longer spreads
}

export const generatePersonalizedReading = async (
  request: ReadingRequest
): Promise<PersonalizedReading> => {
  try {
    const prompt = buildReadingPrompt(request);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: request.spreadType === 'quick-draw' ? 300 : 750,
      temperature: 0.7, // Slight randomness for personality
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

    return parseReadingResponse(response.text, request.spreadType);
  } catch (error) {
    console.error('Failed to generate personalized reading:', error);
    throw new Error('Unable to generate reading. Please try again.');
  }
};

const buildReadingPrompt = (request: ReadingRequest): string => {
  const { cards, blockType, userContext, userProfile, spreadType } = request;

  // Get profession-specific metaphor style
  const metaphorStyle = getProfessionMetaphors(userProfile.profession);

  // Build card context with perspective prompts
  const cardDetails = cards
    .map((card, index) => {
      const blockApplication =
        card.block_applications[
          blockType.id as keyof typeof card.block_applications
        ];
      const perspectivePrompts = card.perspective_prompts?.slice(0, 2) || [];

      return (
        `Card ${index + 1}: ${card.emoji} ${card.name}\n` +
        `Duck's Question: "${card.duck_question}"\n` +
        `For ${blockType.name} blocks: ${blockApplication}\n` +
        `Key perspectives: ${perspectivePrompts.join(' / ')}\n` +
        `Rob's wisdom: "${card.duck_wisdom}"\n` +
        `Core meaning: ${card.core_meaning}\n` +
        `Reversed meaning: ${card.reversed_meaning}\n` +
        `Reversed: ${card.reversed}`
      );
    })
    .join('\n\n');

  const clientProfile = `
    Name: ${userProfile.name}
    Profession: ${userProfile.profession.name} - ${metaphorStyle.note}
    Debugging Style: ${userProfile.debugging_mode}
    Primary Block Pattern: ${userProfile.block_pattern}
    Superpower: "${userProfile.superpower}"
    Kryptonite: "${userProfile.kryptonite}"
    Problem-solving Spirit: ${userProfile.spirit_animal}
  `;

  const basePrompt = `
    <client_profile>${clientProfile}</client_profile>

    <consultation_details>
      Type: ${spreadType.replace('-', ' ')} consultation
      Block Category: ${blockType.name}
      Client's Situation: "${userContext}"
    </consultation_details>

    <cards_drawn>${cardDetails}</cards_drawn>

    <spread_instructions>${getSpreadSpecificInstructions(spreadType)}</spread_instructions>

    <profile_integration>
      * Integrate the client's profile (profession, debugging style, superpower, kryptonite, spirit animal)
      directly into your interpretation of each card. Let these traits influence how you explain the card
      meanings and advice, tailoring insights and action steps to their unique strengths,
      challenges, and mindset.
      
      * Use ${metaphorStyle.style}—keep it practical, not mystical.
    </profile_integration>

    Respond in valid JSON format:
    {
      "interpretation": "Main reading combining the cards for their specific situation",
      "keyInsights": ["Array of 3-4 key insights"],
      "actionSteps": ["Array of 2-3 specific, actionable steps"],
      "robQuip": "Rob's signature sarcastic but encouraging closing line"${spreadType !== 'quick-draw' ? ',\n  "reflectionPrompts": ["Questions to help them think deeper about the insights"]' : ''}
    }`;

  return basePrompt;
};

const getSpreadSpecificInstructions = (spreadType: string): string => {
  switch (spreadType) {
    case 'quick-draw':
      return `QUICK DRAW RULES:
        - Follow Oblique Strategies approach: sharp, surgical insight
        - For the drawn card, use its core meaning (or reversed meaning if reversed) as the main lens for interpreting the user's situation or blocker.
        - Directly connect the card's meaning to the user's question or blocker, in a practical, literal way.
        - Focus on ONE reframe question + ONE action
        - Keep interpretation to 2-3 sentences max
        - No reflection prompts needed - they should figure it out themselves`;

    case 'duck-insight':
      return `DUCK INSIGHT RULES:
        - 3-card reading: situation/challenge/action approach
        - For each card, use its core meaning (or reversed meaning if reversed) as the main lens for interpreting the user's situation, challenge, or action.
        - Directly relate each card's meaning to the user's question or blocker, in a practical, literal way (Lenormand style).
        - Synthesize the cards in sequence: context → challenge → advice.
        - Combine card meanings for a nuanced, actionable answer.
        - Balance insight with actionable guidance
        - Include reflection prompts to deepen understanding
        - Deep integration of their profile with card meanings
        - Multiple layers of insight and practical steps
        - Strong reflection prompts for continued self-discovery`;

    default:
      return '';
  }
};

const parseReadingResponse = (
  response: string,
  spreadType: string
): PersonalizedReading => {
  // Remove code block markers if present
  let cleaned = response.trim();
  // Remove leading/trailing ```json or ``` if present
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      interpretation: parsed.interpretation || '',
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
      actionSteps: Array.isArray(parsed.actionSteps) ? parsed.actionSteps : [],
      robQuip:
        parsed.robQuip ||
        "Now quit overthinking and go debug your life. I've got other ethereal consultations to handle.",
      reflectionPrompts:
        spreadType !== 'quick-draw'
          ? parsed.reflectionPrompts || []
          : undefined,
    };
  } catch (parseError) {
    console.error('Failed to parse Claude response as JSON:', parseError);

    // Fallback: extract what we can from plain text
    const interpretation = cleaned.includes('{')
      ? cleaned.substring(0, cleaned.indexOf('{'))
      : cleaned;

    return {
      interpretation: interpretation.trim() || cleaned,
      keyInsights: ['The cards suggest looking at this from a different angle'],
      actionSteps: ['Take one small step forward today'],
      robQuip:
        'Well, my JSON parsing just crashed like a startup demo. But the advice stands - go make something happen.',
      reflectionPrompts:
        spreadType !== 'quick-draw'
          ? ['What insight resonates most with your current situation?']
          : undefined,
    };
  }
};
