import { supabase } from '../supabase/supabase';
import type { UserCardReflection } from '@/supabase/schema';
import {
  sanitizeReflectionInput,
  validateUserId,
  validateCardId,
  validatePromptIndex,
} from '../input-sanitization';

export const saveReflection = async (
  userId: string,
  cardId: number,
  promptIndex: number,
  reflectionText: string,
  blockTypeId?: string
): Promise<void> => {
  const sanitizedInput = sanitizeReflectionInput({
    userId,
    cardId,
    promptIndex,
    reflectionText,
    blockTypeId,
  });

  const { error } = await supabase.from('user_card_reflections').upsert(
    {
      user_id: sanitizedInput.userId,
      card_id: sanitizedInput.cardId,
      prompt_index: sanitizedInput.promptIndex,
      reflection_text: sanitizedInput.reflectionText,
      block_type_id: sanitizedInput.blockTypeId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_card_prompt_unique_idx',
      ignoreDuplicates: false,
    }
  );

  if (error) throw error;
};

export const getReflectionsByUserAndCard = async (
  userId: string,
  cardId: number
): Promise<UserCardReflection[]> => {
  const validatedUserId = validateUserId(userId);
  const validatedCardId = validateCardId(cardId);

  const { data, error } = await supabase
    .from('user_card_reflections')
    .select('*')
    .eq('user_id', validatedUserId)
    .eq('card_id', validatedCardId)
    .order('prompt_index', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getReflectionsByUser = async (
  userId: string
): Promise<UserCardReflection[]> => {
  const validatedUserId = validateUserId(userId);

  const { data, error } = await supabase
    .from('user_card_reflections')
    .select('*')
    .eq('user_id', validatedUserId)
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
  const validatedUserId = validateUserId(userId);
  const validatedCardId = validateCardId(cardId);
  const validatedPromptIndex = validatePromptIndex(promptIndex);

  const { data, error } = await supabase
    .from('user_card_reflections')
    .select('*')
    .eq('user_id', validatedUserId)
    .eq('card_id', validatedCardId)
    .eq('prompt_index', validatedPromptIndex)
    .maybeSingle();

  if (error) throw error;
  return data;
};
