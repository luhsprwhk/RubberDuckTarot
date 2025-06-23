import { supabase } from '@/lib/supabase/supabase';
import type { Insight } from '@/src/interfaces';

export const getUserInsights = async (userId?: string): Promise<Insight[]> => {
  let query = supabase
    .from('insights')
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
