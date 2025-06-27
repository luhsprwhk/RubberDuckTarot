import type { Card } from '@/src/interfaces';
import { supabase } from '../supabase/supabase';

// Cards
export const getAllCards = async (): Promise<Card[]> => {
  const { data, error } = await supabase.from('cards').select('*').order('id');

  if (error) throw error;
  return data;
};

export const getCardById = async (id: number): Promise<Card | null> => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};
