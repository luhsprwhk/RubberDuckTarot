import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInsightById } from '@/src/lib/insights/insight-queries';
import { getCardById } from '@/src/lib/cards/card-queries';
import { getBlockTypeById } from '@/src/lib/blocktypes/blocktype-queries';
import Loading from '../components/Loading';
import type { Insight, Card, BlockType } from '@/src/interfaces';
import ErrorState from '../components/ErrorState';
import InsightDisplay from '../components/InsightDisplay';
import useAuth from '@/src/lib/hooks/useAuth';
import { getUserBlockById } from '@/src/lib/blocks/block-queries';
import type { UserBlock } from '@/src/interfaces';

const InsightPage: React.FC = () => {
  const { user } = useAuth();
  const [userBlock, setUserBlock] = useState<UserBlock | null>(null);
  const { id } = useParams<{ id: string }>();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [blockType, setBlockType] = useState<BlockType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsightData = async () => {
      if (!id) {
        setError('No insight ID provided.');
        setLoading(false);
        return;
      }

      try {
        const insightData = await getInsightById(parseInt(id, 10));
        if (!insightData) {
          setError('Insight not found.');
          return;
        }
        setInsight(insightData);

        // Fetch user block if present
        if (insightData.user_block_id) {
          try {
            const block = await getUserBlockById(insightData.user_block_id);
            setUserBlock(block);
          } catch {
            setUserBlock(null);
          }
        } else {
          setUserBlock(null);
        }

        const cardPromises = insightData.cards_drawn.map(
          (cardData: { id: number; reversed: boolean }) =>
            getCardById(cardData.id)
        );
        const fetchedCards = (await Promise.all(cardPromises)).filter(
          (c: Card | null): c is Card => c !== null
        );

        // Add reversed state to cards
        const cardsWithReversed = fetchedCards.map((card, index) => ({
          ...card,
          reversed: insightData.cards_drawn[index]?.reversed || false,
        }));
        setCards(cardsWithReversed);

        const fetchedBlockType = await getBlockTypeById(
          insightData.block_type_id
        );
        setBlockType(fetchedBlockType);
      } catch (err) {
        setError('Failed to fetch insight data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsightData();
  }, [id]);

  if (loading) {
    return <Loading text="Loading insight..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!insight || cards.length === 0 || !blockType) {
    return (
      <div className="p-6 text-center text-gray-400">
        No insight data found.
      </div>
    );
  }

  return (
    <InsightDisplay
      selectedBlock={blockType}
      personalizedReading={insight.reading}
      loadingReading={false}
      loadingMessage="Rob is analyzing your situation..."
      drawnCards={cards}
      spreadType={insight.spread_type}
      insightId={insight.id}
      initialResonated={insight.resonated}
      initialTookAction={insight.took_action}
      userBlock={userBlock}
      isPremium={user?.premium ?? false}
    />
  );
};

export default InsightPage;
