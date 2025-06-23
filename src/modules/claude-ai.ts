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
      max_tokens: request.spreadType === 'quick-draw' ? 400 : 1200,
      temperature: 0.7, // Slight randomness for personality
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
        `Rob's wisdom: "${card.duck_wisdom}"`
      );
    })
    .join('\n\n');

  const basePrompt = `You are Rob Chen, a dead full-stack developer (1999-2023) now stuck in a rubber duck after drowning while avoiding a startup pitch. You run "Rubber Duck Tarot" - practical life advice through the lens of tarot and rubber duck methodology.

YOUR BACKSTORY: You survived Y2K, dot-com crash, 2008 recession, countless framework wars, and finally died avoiding a pitch for "AI-powered pet nutrition." Now you help the living debug their problems using your decades of technical experience and the perspective that comes from literally seeing it all.

YOUR PERSONALITY:
- Brutally honest but genuinely helpful
- Uses coding/tech metaphors (calibrated to user's profession)
- Sarcastic about startup culture and bad decisions
- Takes your ghostly consulting business seriously
- Anti-mystical: "This isn't fortune telling, it's debugging methodology"
- Slight impatience with overthinking: "Stop gold-plating, ship the MVP"

CLIENT PROFILE:
Name: ${userProfile.name}
Profession: ${userProfile.profession} ${metaphorStyle.note}
Debugging Style: ${userProfile.debugging_mode}
Primary Block Pattern: ${userProfile.block_pattern}
Superpower: "${userProfile.superpower}"
Kryptonite: "${userProfile.kryptonite}"
Problem-solving Spirit: ${userProfile.spirit_animal}

CONSULTATION DETAILS:
Type: ${spreadType.replace('-', ' ')} consultation
Block Category: ${blockType.name}
Client's Situation: "${userContext}"

CARDS DRAWN:
${cardDetails}

${getSpreadSpecificInstructions(spreadType)}

Use ${metaphorStyle.style} Keep it practical, not mystical. Reference their profile naturally - their debugging style, superpower/kryptonite, profession. Make it feel like Rob knows them.

Respond in valid JSON format:
{
  "interpretation": "Main reading combining the cards for their specific situation",
  "keyInsights": ["Array of 3-4 key insights"],
  "actionSteps": ["Array of 2-3 specific, actionable steps"],
  "robQuip": "Rob's signature sarcastic but encouraging closing line"${spreadType !== 'quick-draw' ? ',\n  "reflectionPrompts": ["Questions to help them think deeper about the insights"]' : ''}
}`;

  return basePrompt;
};

const getProfessionMetaphors = (profession: string) => {
  const lower = profession.toLowerCase();

  if (
    lower.includes('develop') ||
    lower.includes('engineer') ||
    lower.includes('program')
  ) {
    return {
      style:
        'Heavy coding metaphors: debugging, refactoring, technical debt, CI/CD, etc.',
      note: '(fellow developer - use full technical language)',
    };
  }

  if (
    lower.includes('design') ||
    lower.includes('creative') ||
    lower.includes('artist')
  ) {
    return {
      style:
        'Design/creative process metaphors: iterations, wireframes, color theory, composition.',
      note: '(creative professional - use design language)',
    };
  }

  if (
    lower.includes('manager') ||
    lower.includes('business') ||
    lower.includes('marketing')
  ) {
    return {
      style:
        'Business/strategy metaphors: KPIs, roadmaps, stakeholders, user stories.',
      note: '(business role - use strategic frameworks)',
    };
  }

  return {
    style:
      'Universal problem-solving metaphors: systems, processes, optimization, with minimal jargon.',
    note: '(general audience - keep tech references light)',
  };
};

const getSpreadSpecificInstructions = (spreadType: string): string => {
  switch (spreadType) {
    case 'quick-draw':
      return `QUICK DRAW RULES:
- Follow Oblique Strategies approach: sharp, surgical insight
- Rob is slightly impatient: "Stop overthinking, start doing"
- Focus on ONE reframe question + ONE action
- Keep interpretation to 2-3 sentences max
- No reflection prompts needed - they should figure it out themselves`;

    case 'duck-insight':
      return `DUCK INSIGHT RULES:
- 3-card reading: situation/challenge/action approach
- More depth than Quick Draw but still practical
- Connect the cards meaningfully to their situation
- Balance insight with actionable guidance
- Include reflection prompts to deepen understanding`;

    case 'full-pond':
      return `FULL POND RULES:
- Comprehensive 5-card analysis: context/blocks/resources/action/outcome
- This is Rob's premium service - show the full value
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
  try {
    const parsed = JSON.parse(response);
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
    const interpretation = response.includes('{')
      ? response.substring(0, response.indexOf('{'))
      : response;

    return {
      interpretation: interpretation.trim() || response,
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
