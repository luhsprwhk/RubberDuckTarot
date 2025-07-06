import { supabase } from './supabase/supabase';
import type { UserProfile } from '../interfaces';
import { encryptObject, decryptObject } from './encryption';

export const saveUserProfile = async (
  profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
) => {
  // Encrypt sensitive fields before saving
  const encryptedProfile = await encryptObject(profile, [
    'name',
    'birthday',
    'birth_place',
  ]);

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(encryptedProfile, {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save profile: ${error.message}`);
  }

  // Decrypt the returned data for the client
  return await decryptObject(data, ['name', 'birthday', 'birth_place']);
};

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null;
    }
    throw new Error(`Failed to get profile: ${error.message}`);
  }

  // Decrypt sensitive fields before returning
  return await decryptObject(data, ['name', 'birthday', 'birth_place']);
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  // Encrypt sensitive fields in updates
  const encryptedUpdates = await encryptObject(updates, [
    'name',
    'birthday',
    'birth_place',
  ]);

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...encryptedUpdates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  // Decrypt the returned data for the client
  return await decryptObject(data, ['name', 'birthday', 'birth_place']);
};

export const isProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false;

  const requiredFields: (keyof UserProfile)[] = [
    'name',
    'birthday',
    'birth_place',
    'creative_identity',
    'work_context',
    'zodiac_sign',
    'debugging_mode',
    'block_pattern',
    'superpower',
    'kryptonite',
    'spirit_animal',
  ];

  return requiredFields.every((field) => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== '';
  });
};
