import { supabase } from '../supabase/supabase';
import { encryptObject } from '../encryption';
import type { User } from '../../interfaces';

/**
 * Creates a new user with encrypted email
 */
export const createUser = async (
  authUid: string,
  email: string,
  preferences?: Record<string, unknown>
): Promise<User> => {
  const userData = {
    id: authUid,
    auth_uid: authUid,
    email,
    preferences,
    premium: false,
    created_at: new Date().toISOString(),
  };

  // Encrypt sensitive fields
  const encryptedUserData = await encryptObject(userData, ['email']);

  const { data, error } = await supabase
    .from('users')
    .insert(encryptedUserData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
};

/**
 * Updates a user with encrypted fields
 */
export const updateUser = async (
  userId: string,
  updates: Partial<User>
): Promise<User> => {
  // Encrypt sensitive fields in updates
  const encryptedUpdates = await encryptObject(updates, ['email']);

  const { data, error } = await supabase
    .from('users')
    .update(encryptedUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return data;
};
