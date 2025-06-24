import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInsightById } from '@/src/lib/insights/insight-queries';
import { getCardById } from '@/src/lib/cards/card-queries';
import { getBlockTypeById } from '@/src/lib/blocktypes/blocktype-queries';
import type { Insight, Card, BlockType } from '@/src/interfaces';
import QuickDuckSpread from '../components/QuickDuckSpread';
import FullPondSpread from '../components/FullPondSpread';

const InsightPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

        const cardPromises = insightData.cards_drawn.map((cardId: number) =>
          getCardById(cardId)
        );
        const fetchedCards = (await Promise.all(cardPromises)).filter(
          (c: Card | null): c is Card => c !== null
        );
        setCards(fetchedCards);

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

  const handleReset = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">Loading insight...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!insight || cards.length === 0 || !blockType) {
    return (
      <div className="p-6 text-center text-gray-400">
        No insight data found.
      </div>
    );
  }

  if (insight.spread_type === 'quick-draw' && cards.length === 1) {
    return (
      <QuickDuckSpread
        drawnCard={cards[0]}
        selectedBlock={blockType}
        onReset={handleReset}
        personalizedReading={insight.reading}
        loadingReading={false}
      />
    );
  }

  if (insight.spread_type === 'full-pond' && cards.length === 3) {
    return (
      <FullPondSpread
        drawnCards={cards}
        selectedBlock={blockType}
        onReset={handleReset}
        personalizedReading={insight.reading}
        loadingReading={false}
      />
    );
  }

  return (
    <div className="p-6 text-center text-gray-400">Invalid insight data.</div>
  );
};

export default InsightPage;
