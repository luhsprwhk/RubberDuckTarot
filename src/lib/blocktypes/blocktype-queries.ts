import type { BlockType } from '@/src/interfaces';
import { supabase } from '../supabase/supabase';

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
