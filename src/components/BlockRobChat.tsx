import { useMemo, useState, useEffect } from 'react';
import RobChat, { type RobChatConfig, type Message } from './RobChat';
import type { UserBlock, BlockType, Insight } from '@/src/interfaces';
import { generateBlockChat } from '@/src/ai/generate_block_chat';
import { getInsightsByUserBlockId } from '@/src/lib/insights/insight-queries';
import useAuth from '@/src/lib/hooks/useAuth';

// Simple hash function to convert string to consistent number
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Ensure positive number and avoid collision with insight IDs (which are typically < 1M)
  return Math.abs(hash) + 10000000;
}

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

  // Load block insights when modal opens (if not provided)
  useEffect(() => {
    if (!isOpen) return;

    const abortController = new AbortController();

    const loadBlockInsights = async () => {
      // Use provided insights if available, otherwise load them
      if (initialBlockInsights.length > 0) {
        if (!abortController.signal.aborted) {
          setBlockInsights(initialBlockInsights);
        }
      } else {
        try {
          const insights = await getInsightsByUserBlockId(userBlock.id);
          if (!abortController.signal.aborted) {
            setBlockInsights(insights);
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            console.error('Failed to load block insights:', error);
          }
        }
      }
    };

    loadBlockInsights();

    return () => {
      abortController.abort();
    };
  }, [isOpen, userBlock.id, initialBlockInsights]);

  // Reset insights when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setBlockInsights([]);
    }
  }, [isOpen]);

  const config: RobChatConfig = useMemo(
    () => ({
      // Use composite key hashed to number to ensure unique chat ID
      chatId: hashStringToNumber(`block-${userBlock.id}-${userBlock.user_id}`),
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
