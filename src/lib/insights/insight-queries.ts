import { supabase } from '../supabase/supabase';
import type { Insight } from '@/src/interfaces';

// Insights
export const createInsight = async (
  insight: Omit<Insight, 'id' | 'created_at'>
): Promise<Insight> => {
  const { data, error } = await supabase
    .from('insights')
    .insert(insight)
    .select()
    .single();

  if (error) throw error;
  return data;
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
  return data;
};

export const getInsightById = async (id: number): Promise<Insight | null> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
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
