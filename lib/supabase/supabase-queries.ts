import { supabase } from './supabase';
import type { Card, BlockType, Insight } from './supabase-schema';

// Cards
export const getAllCards = async (): Promise<Card[]> => {
  const { data, error } = await supabase.from('cards').select('*').order('id');

  if (error) throw error;
  return data;
};

export const getCardById = async (id: number): Promise<Card | null> => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Block Types
export const getAllBlockTypes = async (): Promise<BlockType[]> => {
  const { data, error } = await supabase
    .from('block_types')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

export const getBlockTypeById = async (
  id: string
): Promise<BlockType | null> => {
  const { data, error } = await supabase
    .from('block_types')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

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
