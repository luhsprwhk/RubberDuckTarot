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
