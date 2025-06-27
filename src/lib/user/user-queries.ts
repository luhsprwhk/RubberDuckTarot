import { supabase } from '../supabase/supabase';

export const getUserFromAuth = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_uid', userId)
    .single();
  return user;
};
