import { supabase } from '../supabase/supabase';
import { decryptObject } from '../encryption';

export const getUserFromAuth = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_uid', userId)
    .single();

  // Decrypt the email field before returning
  return user ? await decryptObject(user, ['email']) : null;
};
