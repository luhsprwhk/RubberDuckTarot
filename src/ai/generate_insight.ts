import type { ReadingRequest, PersonalizedReading } from './index';
import { getContextMetaphors } from './profession-metaphors';
import systemPrompt from './system-prompt.md?raw';
import { anthropic } from './index';

export const generateInsight = async (
  request: ReadingRequest
): Promise<PersonalizedReading> => {
  try {
    const prompt = buildReadingPrompt(request);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: request.spreadType === 'quick-draw' ? 750 : 1400,
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
  const {
    cards,
    blockType,
    userContext,
    userProfile,
    spreadType,
    previousInsights,
    currentBlock,
  } = request;

  // Get context-specific metaphor style
  const metaphorStyle = getContextMetaphors({
    creative_identity: userProfile.creative_identity,
    work_context: userProfile.work_context,
  });

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
    Creative Identity: ${userProfile.creative_identity}
    Work Context: ${userProfile.work_context} - ${metaphorStyle.note}
    Debugging Style: ${userProfile.debugging_mode}
    Primary Block Pattern: ${userProfile.block_pattern}
    Superpower: "${userProfile.superpower}"
    Kryptonite: "${userProfile.kryptonite}"
    Problem-solving Spirit: ${userProfile.spirit_animal}
    Zodiac Sign: ${userProfile.zodiac_sign}
  `;

  // Format previous insights for context
  const previousInsightsContext =
    previousInsights && previousInsights.length > 0
      ? formatPreviousInsights(previousInsights)
      : null;

  // Format current block context
  const currentBlockContext = currentBlock
    ? formatCurrentBlock(currentBlock)
    : null;

  const basePrompt = `
    <client_profile>${clientProfile}</client_profile>

    <consultation_details>
      Type: ${spreadType.replace('-', ' ')} consultation
      Block Category: ${blockType.name}
      Client's Situation: "${userContext}"
    </consultation_details>

    ${currentBlockContext ? `<current_block>${currentBlockContext}</current_block>` : ''}

    ${previousInsightsContext ? `<previous_consultations>${previousInsightsContext}</previous_consultations>` : ''}

    <cards_drawn>${cardDetails}</cards_drawn>

    <spread_instructions>${getSpreadSpecificInstructions(spreadType)}</spread_instructions>

    <profile_integration>
      * Integrate the client's profile (creative identity, work context, zodiac sign, debugging style, superpower, kryptonite, spirit animal)
      directly into your interpretation of each card. Let these traits influence how you explain the card
      meanings and advice, tailoring insights and action steps to their unique strengths,
      challenges, and mindset. Use ${metaphorStyle.style}—keep it practical, not mystical.
    </profile_integration>

    ${
      currentBlockContext || previousInsightsContext
        ? `<consultation_continuity>
      ${currentBlockContext ? '* IMPORTANT: Reference the current block status and any notes. This shows their current approach and what specific challenges remain.' : ''}
      ${previousInsightsContext ? "* Reference previous consultations for this block. Note what advice was given before, what resonated, and what actions they took (or didn't take)." : ''}
      ${previousInsightsContext ? '* Build on previous insights rather than repeating them. Ask follow-up questions about implementation.' : ''}
      ${previousInsightsContext ? '* If they ignored previous advice, address this directly but supportively.' : ''}
      * Show progression in your understanding of their specific block pattern.
      * Rob remembers everything and should reference specifics naturally.
      ${currentBlockContext ? '* Use block status and timeline to calibrate advice - different strategies for new vs long-term blocks.' : ''}
    </consultation_continuity>`
        : ''
    }

    <response_format>
    Respond in valid JSON format:
    {
      "interpretation": "Main reading combining the cards for their specific situation",
      "keyInsights": [${spreadType === 'quick-draw' ? '"One sharp, practical insight"' : '"Array of 3-4 key insights"'}],
      "actionSteps": [${spreadType === 'quick-draw' ? '"One specific, actionable step"' : '"Array of 2-3 specific, actionable steps"'}],
      "robQuip": "Rob's signature sarcastic, but encouraging and highly empathetic closing line",
      ${spreadType !== 'quick-draw' ? '"reflectionPrompts": ["Questions to help them think deeper about the insights"]' : ''}
    }
    ${spreadType === 'quick-draw' ? '\nIMPORTANT: For quick-draw, ONLY return ONE key insight and ONE action step in the arrays.' : ''}
    </response_format>
  `;

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
    // Handle case where interpretation is itself a JSON string
    const interpretation = parsed.interpretation || '';
    const keyInsights = Array.isArray(parsed.keyInsights)
      ? parsed.keyInsights
      : [];
    const actionSteps = Array.isArray(parsed.actionSteps)
      ? parsed.actionSteps
      : [];
    const robQuip =
      parsed.robQuip ||
      "Now quit overthinking and go debug your life. I've got other ethereal consultations to handle.";
    const reflectionPrompts =
      spreadType !== 'quick-draw' ? parsed.reflectionPrompts || [] : undefined;

    return {
      interpretation,
      keyInsights,
      actionSteps,
      robQuip,
      reflectionPrompts,
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

const formatPreviousInsights = (
  previousInsights: NonNullable<ReadingRequest['previousInsights']>
): string => {
  return previousInsights
    .map((insight, index) => {
      const timeAgo = insight.created_at.toLocaleDateString();
      const resonanceStatus = insight.resonated
        ? '✅ Resonated'
        : '❌ Did not resonate';
      const actionStatus = insight.took_action
        ? '🎯 Took action'
        : '⏳ No action taken';

      return `
Previous Consultation #${index + 1} (${timeAgo}):
Context: "${insight.user_context || 'No specific context provided'}"
Cards Used: ${insight.cards_drawn.length} cards
Rob's Previous Advice:
- Key Insights: ${insight.reading.keyInsights.join('; ')}
- Action Steps: ${insight.reading.actionSteps.join('; ')}
- Rob's Quip: "${insight.reading.robQuip}"
Client Feedback: ${resonanceStatus}, ${actionStatus}
      `.trim();
    })
    .join('\n\n---\n\n');
};

const formatCurrentBlock = (
  block: NonNullable<ReadingRequest['currentBlock']>
): string => {
  const timeWorking = Math.ceil(
    (Date.now() - block.created_at.getTime()) / (1000 * 60 * 60 * 24)
  );
  const lastUpdated = Math.ceil(
    (Date.now() - block.updated_at.getTime()) / (1000 * 60 * 60 * 24)
  );

  return `
Current Block Status:
Name: "${block.name}"
Status: ${block.status}
Days Working: ${timeWorking} days
Last Updated: ${lastUpdated} days ago
${block.notes ? `Notes: "${block.notes}"` : 'No notes recorded'}

Block Analysis:
- Status indicates they are ${block.status === 'active' ? 'actively working' : block.status === 'paused' ? 'taking a break' : 'considering it resolved'}
- Time investment: ${timeWorking < 7 ? 'Just started' : timeWorking < 30 ? 'Working for weeks' : 'Long-term project'}
- Recent activity: ${lastUpdated === 0 ? 'Updated today' : lastUpdated === 1 ? 'Updated yesterday' : lastUpdated < 7 ? 'Updated recently' : 'Stalled for a while'}
  `.trim();
};
