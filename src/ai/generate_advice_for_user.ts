import { type User } from '@/src/interfaces';
import { type Card } from '@/supabase/schema';
import { getUserProfile } from '../lib/userPreferences';
import { getUserBlocks } from '../lib/blocks/block-queries';
import { getInsightsByBlockType } from '../lib/insights/insight-queries';
import { getReflectionsByUserAndCard } from '../lib/reflections/reflection-queries';
import systemPrompt from './system-prompt.md?raw';
import { anthropic } from './index';
import {
  sanitizeUserProfile,
  sanitizeBlocksArray,
  sanitizeInsightsArray,
  sanitizeReflectionsArray,
} from '../lib/ai-prompt-sanitization';

const generateAdviceForUser = async (
  card: Card,
  blockTypeId: string,
  user: User
): Promise<string> => {
  try {
    const userProfile = await getUserProfile(user.id);
    const userBlocks = await getUserBlocks(user.id);
    const recentInsights = await getInsightsByBlockType(user.id, blockTypeId);
    // Only include insights where this specific card appeared in the spread
    const recentInsightsForCard = recentInsights.filter((insight) =>
      insight.cards_drawn?.some((c) => c.id === card.id)
    );
    const reflections = await getReflectionsByUserAndCard(user.id, card.id);

    const relevantBlocks = userBlocks.filter(
      (block) => block.block_type_id === blockTypeId
    );

    // Sanitize all user-provided data before including in prompt
    const sanitizedProfile = sanitizeUserProfile(userProfile);
    const sanitizedBlocks = sanitizeBlocksArray(relevantBlocks);
    const sanitizedInsights = sanitizeInsightsArray(recentInsightsForCard);
    const sanitizedReflections = sanitizeReflectionsArray(reflections);

    const prompt = `Your task is to generate personalized advice for a specific
    user based on their profile and current blocks, adapting the generic card
    advice to their specific situation. Keep it short. Around 140 characters. Like a tweet. Make it feel like a fortune cookie.

User Profile:
- Name: ${sanitizedProfile.name || 'Unknown'}
- Creative Identity: ${sanitizedProfile.creative_identity || 'Unknown'}
- Work Context: ${sanitizedProfile.work_context || 'Unknown'}
- Debugging Mode: ${sanitizedProfile.debugging_mode || 'Unknown'}
- Block Pattern: ${sanitizedProfile.block_pattern || 'Unknown'}
- Superpower: ${sanitizedProfile.superpower || 'Unknown'}
- Kryptonite: ${sanitizedProfile.kryptonite || 'Unknown'}
- Zodiac Sign: ${sanitizedProfile.zodiac_sign || 'Unknown'}
- Spirit Animal: ${sanitizedProfile.spirit_animal || 'Unknown'}

Current ${blockTypeId} blocks:
${sanitizedBlocks.map((block) => `- ${block.name}: ${block.notes || 'No notes'}`).join('\n') || 'No current blocks'}

Recent ${blockTypeId} insights history (for this card):
${
  sanitizedInsights.length > 0
    ? sanitizedInsights
        .map((insight) => {
          const resonanceStatus = insight.resonated
            ? '✅ Resonated'
            : insight.resonated === false
              ? "❌ Didn't resonate"
              : '⏳ Pending';
          const actionStatus = insight.took_action
            ? '✅ Took action'
            : insight.took_action === false
              ? '❌ No action'
              : '⏳ Pending';
          return `- Context: "${insight.user_context || 'No context'}" | ${resonanceStatus} | ${actionStatus}`;
        })
        .join('\n')
    : 'No recent insights for this card'
}

Card Information:
- Name: ${card.name}
- Core Meaning: ${card.core_meaning}

User's reflections on this card:
${
  sanitizedReflections.length > 0
    ? sanitizedReflections
        .map(
          (r, i) =>
            `${i + 1}. "${r.reflection_text}" ${r.block_type_id ? `(relates to ${r.block_type_id})` : ''}`
        )
        .join('\n')
    : 'No reflections yet'
}

Generate personalized advice for this user's ${blockTypeId} area that:
1. Start from the card's core meaning above; cite a keyword or phrase from it to ground the guidance
2. Translate that meaning into a concrete, real-world action or mindset shift that addresses the user's current blocks and profile.
3. Uses Rob's voice (blunt, helpful, tech metaphors)
4. Addresses their specific situation, not generic advice
5. Is around 280 characters maximum - be concise and punchy. Like a tweet
6. Focuses on actionable insights, not fortune telling
7. Considers their insight history - what resonated, what didn't, what actions they took
8. Avoids repeating patterns from insights that didn't resonate or lead to action
9. Incorporates their reflections on this card - what they wrote shows their current thinking and perspective
10. Don't introduce yourself or your background. The user already knows who you are.
11. Don't say the user's name. The user already knows who they are.
12. The user's profile should inform your advice, but not be the focus of it.

Example of ideal advice (format & tone):
"Stop trying to guarantee success and start experimenting. Your next breakthrough might come from the project you think is 'just for fun'."

The advice should feel like Rob knows this person and their specific challenges, learning from their past consultation patterns.`;

    const message = await anthropic.messages.create({
      model: import.meta.env.VITE_ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514',
      max_tokens: 200,
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

    return response.text;
  } catch (error) {
    console.error('Error generating advice:', error);
    return (
      card.block_applications[
        blockTypeId as keyof typeof card.block_applications
      ] || 'No advice available'
    );
  }
};

export default generateAdviceForUser;
