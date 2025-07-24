import { supabase } from '../supabase/supabase';
import type { UserBlock } from '@/supabase/schema';
import { encryptObject, decryptObject } from '../encryption';

// User Blocks
export const createUserBlock = async (
  userBlock: Omit<UserBlock, 'id' | 'created_at' | 'updated_at'>
): Promise<UserBlock> => {
  // Encrypt sensitive fields before saving
  const encryptedUserBlock = await encryptObject(userBlock, [
    'name',
    'notes',
    'resolution_reflection',
  ]);

  const { data, error } = await supabase
    .from('user_blocks')
    .insert(encryptedUserBlock)
    .select()
    .single();

  if (error) throw error;

  try {
    // Decrypt the returned data for the client
    return await decryptObject(data, [
      'name',
      'notes',
      'resolution_reflection',
    ]);
  } catch (error) {
    console.error('Failed to decrypt user block:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
};

export const getUserBlocks = async (
  userId?: string,
  includeArchived: boolean = false
): Promise<UserBlock[]> => {
  let query = supabase
    .from('user_blocks')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.is('user_id', null);
  }

  // Exclude archived blocks by default
  if (!includeArchived) {
    query = query.neq('status', 'archived');
  }

  const { data, error } = await query;

  if (error) throw error;

  // Decrypt sensitive fields for all user blocks
  try {
    return await Promise.all(
      data.map((block) =>
        decryptObject(block, ['name', 'notes', 'resolution_reflection'])
      )
    );
  } catch (error) {
    console.error('Failed to decrypt user blocks:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
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

  if (!data) return null;

  try {
    // Decrypt sensitive fields before returning
    return await decryptObject(data, [
      'name',
      'notes',
      'resolution_reflection',
    ]);
  } catch (error) {
    console.error('Failed to decrypt user block by ID:', error);
    // Return with encrypted fields if decryption fails
    return data;
  }
};

export const updateUserBlockStatus = async (
  blockId: number,
  status: string,
  notes?: string,
  reflection?: string
): Promise<void> => {
  const updates: {
    status: string;
    notes?: string;
    resolution_reflection?: string;
    updated_at: string;
  } = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Handle encryption for fields that need it
  const fieldsToEncrypt: { [key: string]: string } = {};

  if (notes !== undefined) {
    fieldsToEncrypt.notes = notes;
  }

  if (reflection !== undefined) {
    fieldsToEncrypt.resolution_reflection = reflection;
  }

  if (Object.keys(fieldsToEncrypt).length > 0) {
    const encryptedUpdates = await encryptObject(
      fieldsToEncrypt,
      Object.keys(fieldsToEncrypt)
    );
    Object.assign(updates, encryptedUpdates);
  }

  const { error } = await supabase
    .from('user_blocks')
    .update(updates)
    .eq('id', blockId);

  if (error) throw error;
};

export const archiveUserBlock = async (
  blockId: number,
  reflection?: string
): Promise<void> => {
  await updateUserBlockStatus(blockId, 'archived', undefined, reflection);
};

export const deleteUserBlock = async (blockId: number): Promise<void> => {
  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('id', blockId);

  if (error) throw error;
};
