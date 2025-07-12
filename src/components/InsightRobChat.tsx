import { useMemo } from 'react';
import RobChat, { type RobChatConfig, type Message } from './RobChat';
import type { PersonalizedReading } from '@/src/ai';
import type { BlockType, UserProfile } from '@/src/interfaces';
import { generateInsightChat } from '@/src/ai/generate_insight_chat';
import useAuth from '@/src/lib/hooks/useAuth';

interface InsightRobChatProps {
  isOpen: boolean;
  onClose: () => void;
  personalizedReading: PersonalizedReading;
  selectedBlock: BlockType | null;
  userContext: string;
  drawnCards: Array<{ name: string; emoji: string; reversed?: boolean }>;
  userProfile?: UserProfile;
  insightId: number;
  reflectionPrompts?: string[];
}

export default function InsightRobChat({
  isOpen,
  onClose,
  personalizedReading,
  selectedBlock,
  userContext,
  drawnCards,
  userProfile,
  insightId,
  reflectionPrompts,
}: InsightRobChatProps) {
  const { user } = useAuth();

  const config: RobChatConfig = useMemo(
    () => ({
      chatId: insightId,
      title: 'Chat with Rob',
      placeholderText:
        reflectionPrompts && reflectionPrompts.length > 0
          ? 'Discuss a prompt or ask another question...'
          : 'Ask Rob anything about your insight...',

      generateWelcomeMessage: () => {
        if (reflectionPrompts && reflectionPrompts.length > 0) {
          if (reflectionPrompts.length === 1) {
            return `I see you want to explore the reflection prompt. Here it is again for you:\n\n* ${reflectionPrompts[0]}\n\nWould you like to discuss this, or do you have another question?`;
          } else {
            return `I see you want to explore some of the reflection prompts. Here they are again for you:\n\n${reflectionPrompts
              .map((p) => `* ${p}`)
              .join(
                '\n'
              )}\n\nWhich one would you like to discuss? Or do you have another question?`;
          }
        }
        return `Hey there! I see you want to dig deeper into this reading. I'm here to help you debug whatever's still bouncing around in your head. What's your follow-up question?`;
      },

      generateResponse: async (
        userMessage: string,
        conversationHistory: Message[]
      ) => {
        if (!user) throw new Error('User not authenticated');

        return generateInsightChat({
          userMessage,
          conversationHistory,
          originalReading: personalizedReading,
          blockType: selectedBlock,
          userContext,
          drawnCards,
          userId: user.id,
          userProfile,
        });
      },
    }),
    [
      insightId,
      reflectionPrompts,
      personalizedReading,
      selectedBlock,
      userContext,
      drawnCards,
      user,
      userProfile,
    ]
  );

  return <RobChat isOpen={isOpen} onClose={onClose} config={config} />;
}
