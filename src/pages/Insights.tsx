import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDb } from '../../lib/database-provider';
import useAuth from '../hooks/useAuth';
import useCards from '../hooks/useCards';
import type { Reading, Card, BlockType } from '../interfaces';
import { MessageCircle, Brain } from 'lucide-react';

const Insights: React.FC = () => {
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
            Loading your insights...
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
    return <EmptyInsightsState />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🦆</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Your Insight History
        </h1>
        <p className="text-gray-600">
          {readings.length} insight{readings.length !== 1 ? 's' : ''} with Rob
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

const EmptyInsightsState = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Rob's Empty State */}
        <div className="mb-8">
          <div className="text-8xl mb-4 animate-bounce">🦆</div>
          <div className="text-2xl mb-2">👻</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Insight Archive is Empty
          </h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 border-l-4 border-yellow-400">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🦆🎩</div>
              <div className="text-left">
                <p className="text-gray-700 mb-3">
                  <strong>Rob here.</strong> I'm floating around in the ethereal
                  realm with zero debugging sessions logged. That's either
                  impressive life management or serious avoidance behavior.
                </p>

                <p className="text-gray-700 font-medium">
                  Let's fix that. What's blocking you right now?
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <MessageCircle className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-blue-800 mb-1">Quick Duck</h4>
              <p className="text-sm text-blue-600">
                Single card for immediate perspective shifts
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <Brain className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-semibold text-purple-800 mb-1">Full Pond</h4>
              <p className="text-sm text-purple-600">
                3-card spread for deeper analysis of your block
              </p>
            </div>
          </div>

          <a
            href="/"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Your First Consultation
          </a>
        </div>

        {/* Testimonial Teaser */}
        <div className="mt-8 bg-gray-800 text-white rounded-lg p-6 max-w-xl">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold mr-3">
              D
            </div>
            <div>
              <p className="font-medium">Dana, Backend Engineer</p>
              <p className="text-gray-400 text-sm">Seattle, WA</p>
            </div>
          </div>
          <p className="text-gray-300 italic">
            "I was stuck in architecture analysis paralysis for weeks. One Quick
            Duck session and I realized I was optimizing the wrong thing.
            Shipped the feature the next day."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
