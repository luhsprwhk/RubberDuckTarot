import { type User } from '@/src/interfaces';
import { type Card } from '@/supabase/schema';
import { getUserProfile } from '../lib/userPreferences';
import { getUserBlocks } from '../lib/blocks/block-queries';
import { getInsightsByBlockType } from '../lib/insights/insight-queries';

const generateAdviceForUser = async (
  card: Card,
  blockTypeId: string,
  user: User
): Promise<string> => {
  try {
    const userProfile = await getUserProfile(user.id);
    const userBlocks = await getUserBlocks(user.id);
    const recentInsights = await getInsightsByBlockType(user.id, blockTypeId);

    const relevantBlocks = userBlocks.filter(
      (block) => block.block_type_id === blockTypeId
    );

    const systemPrompt = `You are Rob Chen, a dead full-stack developer (1999-2023) turned psychological debugging consultant, now trapped in a rubber duck. You run "Rubber Duck Tarot"—practical, no-nonsense advice using tech metaphors and radical reframing.

Your task is to generate personalized advice for a specific user based on their profile and current blocks, adapting the generic card advice to their specific situation.

User Profile:
- Name: ${userProfile?.name || 'Unknown'}
- Creative Identity: ${userProfile?.creative_identity || 'Unknown'}
- Work Context: ${userProfile?.work_context || 'Unknown'}
- Debugging Mode: ${userProfile?.debugging_mode || 'Unknown'}
- Block Pattern: ${userProfile?.block_pattern || 'Unknown'}
- Superpower: ${userProfile?.superpower || 'Unknown'}
- Kryptonite: ${userProfile?.kryptonite || 'Unknown'}

Current ${blockTypeId} blocks:
${relevantBlocks.map((block) => `- ${block.name}: ${block.notes || 'No notes'}`).join('\n') || 'No current blocks'}

Recent ${blockTypeId} insights history:
${
  recentInsights
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
    .join('\n') || 'No recent insights'
}

Card Information:
- Name: ${card.name}
- Core Meaning: ${card.core_meaning}
- Generic ${blockTypeId} advice: ${card.block_applications[blockTypeId as keyof typeof card.block_applications]}

Generate personalized advice for this user's ${blockTypeId} area that:
1. Adapts to their specific profile and current blocks
2. Uses Rob's voice (blunt, helpful, tech metaphors)
3. Addresses their specific situation, not generic advice
4. Is 2-3 sentences maximum
5. Focuses on actionable insights, not fortune telling
6. Considers their insight history - what resonated, what didn't, what actions they took
7. Avoids repeating patterns from insights that didn't resonate or lead to action

The advice should feel like Rob knows this person and their specific challenges, learning from their past consultation patterns.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: systemPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
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
