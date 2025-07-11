import { supabase } from '../supabase/supabase';
import type { UserCardAdvice } from '../../../supabase/schema';

export interface CreateAdviceParams {
  userId: string;
  cardId: number;
  blockTypeId: string;
  advice: string;
}

export interface GetAdviceParams {
  userId: string;
  cardId: number;
  blockTypeId: string;
}

export const createOrUpdateAdvice = async (
  params: CreateAdviceParams
): Promise<UserCardAdvice> => {
  const { userId, cardId, blockTypeId, advice } = params;

  const { data: existingAdvice, error: selectError } = await supabase
    .from('user_card_advice')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .eq('block_type_id', blockTypeId)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    throw selectError;
  }

  if (existingAdvice) {
    const { data: updated, error } = await supabase
      .from('user_card_advice')
      .update({
        advice,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .eq('block_type_id', blockTypeId)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } else {
    const { data: created, error } = await supabase
      .from('user_card_advice')
      .insert({
        user_id: userId,
        card_id: cardId,
        block_type_id: blockTypeId,
        advice,
      })
      .select()
      .single();

    if (error) throw error;
    return created;
  }
};

export const getAdviceForUserCardBlock = async (
  params: GetAdviceParams
): Promise<UserCardAdvice | null> => {
  const { userId, cardId, blockTypeId } = params;

  const { data, error } = await supabase
    .from('user_card_advice')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .eq('block_type_id', blockTypeId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
};

export const getAllAdviceForUserCard = async (
  userId: string,
  cardId: number
): Promise<UserCardAdvice[]> => {
  const { data, error } = await supabase
    .from('user_card_advice')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId);

  if (error) throw error;
  return data;
};

export const deleteAdvice = async (params: GetAdviceParams): Promise<void> => {
  const { userId, cardId, blockTypeId } = params;

  const { error } = await supabase
    .from('user_card_advice')
    .delete()
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .eq('block_type_id', blockTypeId);

  if (error) throw error;
};
