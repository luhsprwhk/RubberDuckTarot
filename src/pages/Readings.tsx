import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDb } from '../../lib/database-provider';
import useAuth from '../hooks/useAuth';
import useCards from '../hooks/useCards';
import type { Reading, Card, BlockType } from '../shared/interfaces';

const Readings: React.FC = () => {
  const { user } = useAuth();
  const { cards } = useCards();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        setLoading(true);
        const db = await getDb();

        // Fetch readings and block types in parallel
        const [userReadings, allBlockTypes] = await Promise.all([
          db.getUserReadings(user?.id),
          db.getAllBlockTypes(),
        ]);

        setReadings(userReadings);
        setBlockTypes(allBlockTypes);
      } catch (err) {
        console.error('Failed to fetch readings:', err);
        setError('Failed to load your readings');
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [user?.id]);

  const getCardsByIds = (cardIds: number[]): Card[] => {
    return cardIds
      .map((id) => cards.find((card) => card.id === id))
      .filter(Boolean) as Card[];
  };

  const getBlockTypeName = (blockTypeId: string): string => {
    const blockType = blockTypes.find((bt) => bt.id === blockTypeId);
    return blockType ? `${blockType.emoji} ${blockType.name}` : blockTypeId;
  };

  const formatDate = (timestamp: Date | number): string => {
    const date =
      typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦆</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Loading your readings...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🦆</div>
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🦆</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            No Readings Yet
          </h1>
          <p className="text-gray-600 mb-8">
            You haven't done any tarot readings yet. Start your first reading to
            get insights from the duck!
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Your First Reading
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🦆</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Your Reading History
        </h1>
        <p className="text-gray-600">
          {readings.length} reading{readings.length !== 1 ? 's' : ''} with Rob
          the Duck
        </p>
      </div>

      <div className="space-y-6">
        {readings.map((reading) => {
          const readingCards = getCardsByIds(reading.cards_drawn);

          return (
            <div
              key={reading.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {reading.spread_type === 'quick-draw'
                        ? 'Quick Draw'
                        : 'Full Pond'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(reading.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {getBlockTypeName(reading.block_type_id)}
                  </h3>
                  {reading.user_context && (
                    <p className="text-gray-600 text-sm">
                      "{reading.user_context}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {readingCards.map((card, index) => (
                  <div
                    key={`${reading.id}-${card.id}-${index}`}
                    className="flex-1 bg-gray-50 rounded-lg p-3 text-center"
                  >
                    <div className="text-2xl mb-1">{card.emoji}</div>
                    <div className="text-sm font-medium text-gray-800">
                      {card.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {card.traditional_equivalent}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/"
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Get Another Reading
        </Link>
      </div>
    </div>
  );
};

export default Readings;
