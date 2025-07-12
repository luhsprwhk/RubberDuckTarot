import { useMemo, useState, useEffect, useRef } from 'react';
import RobChat, { type RobChatConfig, type Message } from './RobChat';
import type { UserBlock, BlockType, Insight } from '@/src/interfaces';
import { generateBlockChat } from '@/src/ai/generate_block_chat';
import { getInsightsByUserBlockId } from '@/src/lib/insights/insight-queries';
import useAuth from '@/src/lib/hooks/useAuth';

interface BlockRobChatProps {
  isOpen: boolean;
  onClose: () => void;
  userBlock: UserBlock;
  blockType: BlockType;
  blockInsights?: Insight[];
}

export default function BlockRobChat({
  isOpen,
  onClose,
  userBlock,
  blockType,
  blockInsights: initialBlockInsights = [],
}: BlockRobChatProps) {
  const { user } = useAuth();
  const [blockInsights, setBlockInsights] = useState<Insight[]>([]);
  const isMountedRef = useRef(true);

  // Load block insights when modal opens (if not provided)
  useEffect(() => {
    const loadBlockInsights = async () => {
      if (!isOpen || !isMountedRef.current) return;

      // Use provided insights if available, otherwise load them
      if (initialBlockInsights.length > 0) {
        setBlockInsights(initialBlockInsights);
      } else {
        try {
          const insights = await getInsightsByUserBlockId(userBlock.id);
          if (isMountedRef.current) {
            setBlockInsights(insights);
          }
        } catch (error) {
          console.error('Failed to load block insights:', error);
        }
      }
    };

    if (isOpen) {
      loadBlockInsights();
    }
  }, [isOpen, userBlock.id, initialBlockInsights]);

  // Cleanup on component unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset insights when modal is closed
  useEffect(() => {
    if (!isOpen && isMountedRef.current) {
      setBlockInsights([]);
    }
  }, [isOpen]);

  const config: RobChatConfig = useMemo(
    () => ({
      // Use block ID + large number to avoid conflicts with insight IDs
      chatId: userBlock.id + 1000000,
      title: 'Chat with Rob',
      subtitle: `about "${userBlock.name}"`,
      placeholderText: 'Tell Rob about this block...',

      generateWelcomeMessage: () => {
        return `Hey! Let's talk about your "${userBlock.name}" block. I see this is about ${blockType.name.toLowerCase()}. What's been going on with this situation? What would you like to explore or work through?`;
      },

      generateResponse: async (
        userMessage: string,
        conversationHistory: Message[]
      ) => {
        if (!user) throw new Error('User not authenticated');

        return generateBlockChat({
          userMessage,
          conversationHistory,
          userBlock,
          blockType,
          userId: user.id,
          blockInsights,
        });
      },
    }),
    [userBlock, blockType, user, blockInsights]
  );

  return <RobChat isOpen={isOpen} onClose={onClose} config={config} />;
}
