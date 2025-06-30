import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';
import useCards from '../lib/cards/useCards';
import type { BlockType } from '../interfaces';
import { MessageCircle } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useInsights } from '../lib/insights/useInsights';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';

const Insights: React.FC = () => {
  const { user } = useAuth();
  const { cards } = useCards();
  const {
    insights,
    loading: insightsLoading,
    error: insightsError,
    fetchUserInsights,
  } = useInsights();
  const {
    blockTypes,
    loading: blockTypesLoading,
    error: blockTypesError,
    refreshBlockTypes,
  } = useBlockTypes();
  const loading = insightsLoading || blockTypesLoading;
  const error = insightsError || blockTypesError;

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      if (!insights.length && !insightsLoading) {
        fetchUserInsights(user.id);
      }
      if (!blockTypes.length && !blockTypesLoading) {
        refreshBlockTypes();
      }
    }
    // Optionally, clear context if user logs out
  }, [
    user?.id,
    fetchUserInsights,
    refreshBlockTypes,
    insights.length,
    insightsLoading,
    blockTypes.length,
    blockTypesLoading,
  ]);

  const getBlockTypeName = (blockTypeId: string): string => {
    const blockType = blockTypes.find((bt: BlockType) => bt.id === blockTypeId);
    return blockType ? `${blockType.emoji} ${blockType.name}` : blockTypeId;
  };

  const formatDate = (timestamp: Date | number | string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading text="Loading your insights..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (insights.length === 0 && !loading && !error) {
    return <EmptyInsightsState />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🦆</div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Your Insight History
        </h1>
        <p className="text-accent">
          {insights.length} insight{insights.length !== 1 ? 's' : ''} with Rob
          the Duck
        </p>
      </div>

      <div className="space-y-6">
        {insights.map((insight) => {
          return (
            <div
              key={insight.id}
              className="bg-void-800 border-l-4 border-liminal-border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-primary bg-liminal-overlay px-2 py-1 rounded">
                      {insight.spread_type === 'quick-draw'
                        ? 'Quick Draw'
                        : 'Full Pond'}
                    </span>
                    <span className="text-sm text-secondary">
                      {formatDate(insight.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-1">
                    {getBlockTypeName(insight.block_type_id)}
                  </h3>
                  {insight.user_context && (
                    <p className="text-secondary text-sm">
                      "{insight.user_context}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {insight.cards_drawn.map((cardId, index) => {
                  const card = cards.find((c) => c.id === cardId);
                  if (!card) return null;
                  return (
                    <div
                      key={`${insight.id}-${card.id}-${index}`}
                      className="flex-1 bg-void-800 rounded-lg p-3 text-center"
                      onClick={() => navigate(`/insights/${insight.id}`)}
                    >
                      <div className="text-2xl mb-1">{card.emoji}</div>
                      <div className="text-sm font-medium text-secondary">
                        {card.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/"
          className="px-6 py-3 bg-breakthrough-400 text-void-900 font-semibold rounded-lg hover:bg-breakthrough-300 transition-colors"
        >
          Get Another Reading
        </Link>
      </div>
    </div>
  );
};

const EmptyInsightsState = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Rob's Empty State */}

        <div className="bg-void-800 rounded-xl shadow-lg p-8 max-w-2xl border-l-4 border-liminal-border">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Your Insight Archive is Empty
          </h2>

          <div className="bg-void-800 rounded-lg p-6 mb-6 border-l-4 border-yellow-400">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🦆🎩</div>
              <div className="text-left">
                <p className="text-primary mb-3">
                  <strong>Rob here.</strong> I'm floating around in the ethereal
                  realm with zero debugging sessions logged. That's either
                  impressive life management or serious avoidance behavior.
                </p>

                <p className="text-primary font-medium">
                  Let's fix that. What's blocking you right now?
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/new-reading"
            className="inline-flex items-center px-8 py-3 bg-void-gradient text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Your First Consultation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Insights;
