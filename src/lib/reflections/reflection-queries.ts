import { supabase } from '../supabase/supabase';
import type { UserCardReflection } from '@/supabase/schema';
import {
  sanitizeReflectionInput,
  validateUserId,
  validateCardId,
  validatePromptIndex,
} from '../input-sanitization';
import { encryptForDatabase, decryptFromDatabase } from '../encryption';

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

  // Encrypt the sensitive reflection text before storing
  const encryptedReflectionText = await encryptForDatabase(
    sanitizedInput.reflectionText
  );

  const { error } = await supabase.from('user_card_reflections').upsert(
    {
      user_id: sanitizedInput.userId,
      card_id: sanitizedInput.cardId,
      prompt_index: sanitizedInput.promptIndex,
      reflection_text: encryptedReflectionText,
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

  // Decrypt the reflection text for each reflection
  const reflections = data || [];
  const decryptedReflections = await Promise.all(
    reflections.map(async (reflection) => ({
      ...reflection,
      reflection_text:
        (await decryptFromDatabase(reflection.reflection_text)) ||
        reflection.reflection_text,
    }))
  );

  return decryptedReflections;
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

  // Decrypt the reflection text for each reflection
  const reflections = data || [];
  const decryptedReflections = await Promise.all(
    reflections.map(async (reflection) => ({
      ...reflection,
      reflection_text:
        (await decryptFromDatabase(reflection.reflection_text)) ||
        reflection.reflection_text,
    }))
  );

  return decryptedReflections;
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

  // Decrypt the reflection text if data exists
  if (data) {
    return {
      ...data,
      reflection_text:
        (await decryptFromDatabase(data.reflection_text)) ||
        data.reflection_text,
    };
  }

  return data;
};
