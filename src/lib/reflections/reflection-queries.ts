import { supabase } from '../supabase/supabase';
import type { UserCardReflection } from '@/supabase/schema';

export const saveReflection = async (
  userId: string,
  cardId: number,
  promptIndex: number,
  reflectionText: string,
  blockTypeId?: string
): Promise<void> => {
  const { error } = await supabase.from('user_card_reflections').upsert(
    {
      user_id: userId,
      card_id: cardId,
      prompt_index: promptIndex,
      reflection_text: reflectionText,
      block_type_id: blockTypeId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,card_id,prompt_index',
      ignoreDuplicates: false,
    }
  );

  if (error) throw error;
};

export const getReflectionsByUserAndCard = async (
  userId: string,
  cardId: number
): Promise<UserCardReflection[]> => {
  const { data, error } = await supabase
    .from('user_card_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .order('prompt_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getReflectionsByUser = async (
  userId: string
): Promise<UserCardReflection[]> => {
  const { data, error } = await supabase
    .from('user_card_reflections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
};

export const getReflectionByUserCardPrompt = async (
  userId: string,
  cardId: number,
  promptIndex: number
): Promise<UserCardReflection | null> => {
  const { data, error } = await supabase
    .from('user_card_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .eq('prompt_index', promptIndex)
    .maybeSingle();

  if (error) throw error;
  return data;
};
