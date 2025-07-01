import { supabase } from '../supabase/supabase';
import type { UserBlock } from '@/supabase/schema';

// User Blocks
export const createUserBlock = async (
  userBlock: Omit<UserBlock, 'id' | 'created_at' | 'updated_at'>
): Promise<UserBlock> => {
  const { data, error } = await supabase
    .from('user_blocks')
    .insert(userBlock)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserBlocks = async (userId?: string): Promise<UserBlock[]> => {
  let query = supabase
    .from('user_blocks')
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

export const getUserBlockById = async (
  id: number
): Promise<UserBlock | null> => {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }
  return data;
};

export const updateUserBlockProgress = async (
  blockId: number,
  progress: number,
  status?: string,
  notes?: string
): Promise<void> => {
  const updates: {
    progress: number;
    status?: string;
    notes?: string;
    updated_at: string;
  } = {
    progress,
    updated_at: new Date().toISOString(),
  };

  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  const { error } = await supabase
    .from('user_blocks')
    .update(updates)
    .eq('id', blockId);

  if (error) throw error;
};

export const deleteUserBlock = async (blockId: number): Promise<void> => {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('id', blockId);

  if (error) throw error;
};
