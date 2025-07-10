import { type User, type Insight } from '@/src/interfaces';
import { type Card } from '@/supabase/schema';
import { getUserProfile } from '../lib/userPreferences';
import { getUserBlocks } from '../lib/blocks/block-queries';
import { getInsightsByUser } from '../lib/insights/insight-queries';
import { getReflectionsByUserAndCard } from '../lib/reflections/reflection-queries';
import systemPrompt from './system-prompt.md?raw';
import { anthropic } from './index';

const generateRobsTake = async (card: Card, user: User): Promise<string> => {
  try {
    const userProfile = await getUserProfile(user.id);
    const userBlocks = await getUserBlocks(user.id);
    const recentInsights = await getInsightsByUser(user.id);
    const reflections = await getReflectionsByUserAndCard(user.id, card.id);

    const prompt = `Your task is to generate Rob's personalized take on this tarot card for a specific user. This should be a holistic, perspective-shifting commentary about what this card means for this person's current life situation.

User Profile:
- Name: ${userProfile?.name || 'Unknown'}
- Creative Identity: ${userProfile?.creative_identity || 'Unknown'}
- Work Context: ${userProfile?.work_context || 'Unknown'}
- Debugging Mode: ${userProfile?.debugging_mode || 'Unknown'}
- Block Pattern: ${userProfile?.block_pattern || 'Unknown'}
- Superpower: ${userProfile?.superpower || 'Unknown'}
- Kryptonite: ${userProfile?.kryptonite || 'Unknown'}

Current blocks across all areas:
${userBlocks.map((block) => `- ${block.name} (${block.block_type_id}): ${block.notes || 'No notes'}`).join('\n') || 'No current blocks'}

Recent insights pattern:
${
  recentInsights
    .slice(0, 5)
    .map((insight: Insight) => {
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
    .join('\n') || 'No recent insights'
}

Card Information:
- Name: ${card.name}
- Core Meaning: ${card.core_meaning}
- Duck Question: ${card.duck_question || 'N/A'}
- Generic Duck Wisdom: ${card.duck_wisdom}

User's reflections on this card:
${
  reflections.length > 0
    ? reflections
        .map(
          (r, i) =>
            `${i + 1}. "${r.reflection_text}" ${r.block_type_id ? `(relates to ${r.block_type_id})` : ''}`
        )
        .join('\n')
    : 'No reflections yet'
}

Generate Rob's personalized take on this card that:
1. Provides meta-commentary on why this card is relevant to this user right now
2. Uses Rob's voice (blunt, tech metaphors, perspective-shifting)
3. Considers their overall patterns, not just specific blocks
4. Is 2-3 sentences, more philosophical than tactical
5. Challenges assumptions or provides a reframe about their situation
6. References their profile/patterns to show Rob "knows" them
7. Focuses on the bigger picture meaning of this card for this person
8. IMPORTANT: Incorporates their reflections - what they wrote reveals their current mindset and self-awareness
9. Don't introduce yourself or say the user's name - just give the take
10. Make it feel like Rob is commenting on the deeper significance of this card appearing in their life

This should feel like Rob's overarching wisdom about what this card means for this specific person's journey.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
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
    console.error("Error generating Rob's take:", error);
    // Fallback to generic duck wisdom
    return card.duck_wisdom;
  }
};

export default generateRobsTake;
