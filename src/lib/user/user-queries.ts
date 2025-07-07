import { supabase } from '../supabase/supabase';
import { decryptObject } from '../encryption';

export const getUserFromAuth = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_uid', userId)
    .single();

  if (!user) return null;

  try {
    // Decrypt the email field before returning
    return await decryptObject(user, ['email']);
  } catch (error) {
    console.error('Failed to decrypt user data:', error);
    // Return user with encrypted email if decryption fails
    // This allows the app to continue working even if encryption is not properly configured
    return user;
  }
};
