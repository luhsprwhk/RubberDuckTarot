import { type User } from '@/src/interfaces';
import { type Card } from '@/supabase/schema';
import { getUserProfile } from '../lib/userPreferences';
import { getUserBlocks } from '../lib/blocks/block-queries';
import { getInsightsByBlockType } from '../lib/insights/insight-queries';
import systemPrompt from './system-prompt.md?raw';
import { anthropic } from './index';

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

    const prompt = `Your task is to generate personalized advice for a specific
    user based on their profile and current blocks, adapting the generic card
    advice to their specific situation.

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

Generate personalized advice for this user's ${blockTypeId} area that:
1. Adapts to their specific profile and current blocks
2. Uses Rob's voice (blunt, helpful, tech metaphors)
3. Addresses their specific situation, not generic advice
4. Is around 280 characters maximum - be concise and punchy. Like a tweet
5. Focuses on actionable insights, not fortune telling
6. Considers their insight history - what resonated, what didn't, what actions they took
7. Avoids repeating patterns from insights that didn't resonate or lead to action
8. Don't introduce yourself or your background. The user already knows who you are.
9. Don't say the user's name. The user already knows who they are.

The advice should feel like Rob knows this person and their specific challenges, learning from their past consultation patterns.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 250,
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
