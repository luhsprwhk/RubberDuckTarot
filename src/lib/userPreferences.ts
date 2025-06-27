import { supabase } from './supabase/supabase';
import type { UserProfile } from '../interfaces';

export const saveUserProfile = async (
  profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile, {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save profile: ${error.message}`);
  }

  return data;
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

  return data;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
};

export const isProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false;

  const requiredFields: (keyof UserProfile)[] = [
    'name',
    'birthday',
    'birth_place',
    'profession',
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
