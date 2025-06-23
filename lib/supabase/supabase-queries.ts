import { supabase } from './supabase';
import type { Card, BlockType, Insight } from './supabase-schema';

// Legacy alias for backward compatibility
type Reading = Insight;

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

// Readings
export const createReading = async (
  reading: Omit<Reading, 'id' | 'created_at'>
): Promise<Reading> => {
  const { data, error } = await supabase
    .from('insights')
    .insert(reading)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserReadings = async (userId?: string): Promise<Reading[]> => {
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

export const getReadingById = async (id: number): Promise<Reading | null> => {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};
