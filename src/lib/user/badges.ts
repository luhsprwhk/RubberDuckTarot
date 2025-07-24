import { supabase } from '../supabase/supabase';

export const BADGES = {
  FIRST_BLOCK_RESOLVED: 'first-block-resolved',
  FIVE_BLOCKS_RESOLVED: 'five-blocks-resolved',
  FIRST_INSIGHT: 'first-insight',
  CHAT_WITH_ROB: 'chat-with-rob',
} as const;

export type Badge = (typeof BADGES)[keyof typeof BADGES];

export const BADGE_METADATA = {
  [BADGES.FIRST_BLOCK_RESOLVED]: {
    name: 'Block Breaker',
    description: 'Resolved your first block',
    emoji: '🎯',
  },
  [BADGES.FIVE_BLOCKS_RESOLVED]: {
    name: 'Debugging Dynamo',
    description: 'Resolved 5 blocks',
    emoji: '🚀',
  },
  [BADGES.FIRST_INSIGHT]: {
    name: 'First Steps',
    description: 'Got your first insight from Rob',
    emoji: '🦆',
  },
  [BADGES.CHAT_WITH_ROB]: {
    name: 'Deep Dive',
    description: 'Had a conversation with Rob',
    emoji: '💬',
  },
} as const;

export const awardBadge = async (
  userId: string,
  badge: Badge
): Promise<boolean> => {
  try {
    // Get current user badges
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('badges')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user badges:', fetchError);
      return false;
    }

    const currentBadges = user?.badges || [];

    // Check if user already has this badge
    if (currentBadges.includes(badge)) {
      return false; // Badge already awarded
    }

    // Add new badge
    const updatedBadges = [...currentBadges, badge];

    const { error: updateError } = await supabase
      .from('users')
      .update({ badges: updatedBadges })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user badges:', updateError);
      return false;
    }

    return true; // Badge successfully awarded
  } catch (error) {
    console.error('Error in awardBadge:', error);
    return false;
  }
};

export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('badges')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return user?.badges || [];
  } catch (error) {
    console.error('Error in getUserBadges:', error);
    return [];
  }
};

export const checkAndAwardBlockBadges = async (
  userId: string
): Promise<Badge[]> => {
  try {
    // Count resolved blocks for this user
    const { count: resolvedCount, error: countError } = await supabase
      .from('user_blocks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'resolved');

    if (countError) {
      console.error('Error counting resolved blocks:', countError);
      return [];
    }

    const newBadges: Badge[] = [];

    // Check for first block resolved badge
    if (resolvedCount === 1) {
      const awarded = await awardBadge(userId, BADGES.FIRST_BLOCK_RESOLVED);
      if (awarded) {
        newBadges.push(BADGES.FIRST_BLOCK_RESOLVED);
      }
    }

    // Check for five blocks resolved badge
    if (resolvedCount === 5) {
      const awarded = await awardBadge(userId, BADGES.FIVE_BLOCKS_RESOLVED);
      if (awarded) {
        newBadges.push(BADGES.FIVE_BLOCKS_RESOLVED);
      }
    }

    return newBadges;
  } catch (error) {
    console.error('Error in checkAndAwardBlockBadges:', error);
    return [];
  }
};
