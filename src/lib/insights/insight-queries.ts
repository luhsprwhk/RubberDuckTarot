import { supabase } from '../supabase/supabase';
import type { Insight } from '@/src/interfaces';
import { encryptObject, decryptObject } from '../encryption';

// Insights
export const createInsight = async (
  insight: Omit<Insight, 'id' | 'created_at'>
): Promise<Insight> => {
  // Encrypt sensitive fields before saving
  const encryptedInsight = await encryptObject(insight, [
    'user_context',
    'reading',
  ]);

  const { data, error } = await supabase
    .from('insights')
    .insert(encryptedInsight)
    .select()
    .single();

  if (error) throw error;

  try {
    // Decrypt the returned data for the client
    return await decryptObject(data, ['user_context', 'reading']);
  } catch (error) {
    console.error('Failed to decrypt created insight:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
};

export const getUserInsights = async (userId?: string): Promise<Insight[]> => {
  let query = supabase
    .from('insights')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.is('user_id', null);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Decrypt sensitive fields for all insights
  try {
    return await Promise.all(
      data.map((insight) => decryptObject(insight, ['user_context', 'reading']))
    );
  } catch (error) {
    console.error('Failed to decrypt user insights:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
};

export const getInsightById = async (id: number): Promise<Insight | null> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  if (!data) return null;

  try {
    // Decrypt sensitive fields before returning
    return await decryptObject(data, ['user_context', 'reading']);
  } catch (error) {
    console.error('Failed to decrypt insight by ID:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
};

export const updateInsightSentiment = async (
  insightId: number,
  resonated?: boolean,
  tookAction?: boolean
): Promise<void> => {
  const updates: { resonated?: boolean; took_action?: boolean } = {};

  if (resonated !== undefined) updates.resonated = resonated;
  if (tookAction !== undefined) updates.took_action = tookAction;

  const { error } = await supabase
    .from('insights')
    .update(updates)
    .eq('id', insightId);

  if (error) throw error;
};

export const getInsightsByUserBlockId = async (
  userBlockId: number
): Promise<Insight[]> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_block_id', userBlockId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Decrypt sensitive fields for all insights
  try {
    return await Promise.all(
      data.map((insight) => decryptObject(insight, ['user_context', 'reading']))
    );
  } catch (error) {
    console.error('Failed to decrypt insights by user block ID:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
};

export const getInsightsByBlockType = async (
  userId: string,
  blockTypeId: string
): Promise<Insight[]> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .eq('block_type_id', blockTypeId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  // Decrypt sensitive fields for all insights
  try {
    return await Promise.all(
      data.map((insight) => decryptObject(insight, ['user_context', 'reading']))
    );
  } catch (error) {
    console.error('Failed to decrypt insights by block type:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
};

export const getInsightsByUser = async (userId: string): Promise<Insight[]> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  // Decrypt sensitive fields for all insights
  try {
    return await Promise.all(
      data.map((insight) => decryptObject(insight, ['user_context', 'reading']))
    );
  } catch (error) {
    console.error('Failed to decrypt insights by user:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
};

// Enhanced function to get insights with their associated block information
export const getUserInsightsWithBlocks = async (
  userId?: string
): Promise<
  (Insight & {
    associatedBlock?: { id: number; name: string; status: string };
  })[]
> => {
  // First, fetch all insights
  const insights = await getUserInsights(userId);

  // Get unique block IDs from insights that have them
  const blockIds = [
    ...new Set(
      insights
        .filter(
          (insight) =>
            insight.user_block_id !== null &&
            insight.user_block_id !== undefined
        )
        .map((insight) => insight.user_block_id)
    ),
  ];

  // If no blocks to fetch, return insights as-is
  if (blockIds.length === 0) {
    return insights.map((insight) => ({
      ...insight,
      associatedBlock: undefined,
    }));
  }

  // Fetch associated blocks with proper decryption
  const { data: blocksData, error: blocksError } = await supabase
    .from('user_blocks')
    .select('id, name, status')
    .in('id', blockIds);

  if (blocksError) {
    console.error('Failed to fetch associated blocks:', blocksError);
    // Return insights without block data if block fetch fails
    return insights.map((insight) => ({
      ...insight,
      associatedBlock: undefined,
    }));
  }

  // Decrypt the block names
  let blocks;
  try {
    blocks = await Promise.all(
      blocksData.map((block) => decryptObject(block, ['name']))
    );
  } catch (error) {
    console.error('Failed to decrypt block names:', error);
    // Return with encrypted names if decryption fails
    blocks = blocksData;
  }

  // Create a map of block ID to block data for quick lookup
  const blockMap = new Map(blocks.map((block) => [block.id, block]));

  // Combine insights with their associated block data
  return insights.map((insight) => {
    const result: Insight & {
      associatedBlock?: { id: number; name: string; status: string };
    } = { ...insight };

    if (insight.user_block_id && blockMap.has(insight.user_block_id)) {
      const block = blockMap.get(insight.user_block_id)!;
      result.associatedBlock = {
        id: block.id,
        name: block.name,
        status: block.status,
      };
    }

    return result;
  });
};
