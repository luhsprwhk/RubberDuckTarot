import { supabase } from '@/lib/supabase/supabase';

export const getUserFromAuth = async (userId: string) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_uid', userId)
    .single();
  return user;
};
