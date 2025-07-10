import { type User } from '@/src/interfaces';
import { type Card } from '@/supabase/schema';
import generateAdviceForUser from '../../ai/generate_advice_for_user';
import {
  getAdviceForUserCardBlock,
  createOrUpdateAdvice,
} from '../advice/advice-operations';

const getAdviceForUser = async (
  card: Card,
  blockTypeId: string,
  user: User
): Promise<string> => {
  try {
    const existingAdvice = await getAdviceForUserCardBlock({
      userId: user.id,
      cardId: card.id,
      blockTypeId,
    });

    if (existingAdvice) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(existingAdvice.last_updated).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSinceUpdate < 7) {
        return existingAdvice.advice;
      }
    }

    const newAdvice = await generateAdviceForUser(card, blockTypeId, user);

    await createOrUpdateAdvice({
      userId: user.id,
      cardId: card.id,
      blockTypeId,
      advice: newAdvice,
    });

    return newAdvice;
  } catch (error) {
    console.error('Error getting advice for user:', error);
    return (
      card.block_applications[
        blockTypeId as keyof typeof card.block_applications
      ] || 'No advice available'
    );
  }
};

export default getAdviceForUser;
