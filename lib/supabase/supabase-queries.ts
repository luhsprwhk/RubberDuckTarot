import { supabase } from './supabase';
import type { Card, BlockType } from './supabase-schema';

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
