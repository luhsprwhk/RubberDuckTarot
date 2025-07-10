import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';
import useCards from '../lib/cards/useCards';
import type { BlockType } from '../interfaces';
import { MessageCircle } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useInsights } from '../lib/insights/useInsights';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import robEmoji from '../assets/rob-emoji.png';
import { ArrowRight } from 'lucide-react';

const insightPanelClass =
  'bg-liminal-surface border-liminal-overlay shadow-breakthrough border border-liminal-border rounded-lg';
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

  const error = insightsError || blockTypesError;

  const [initialLoading, setInitialLoading] = React.useState(true);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!insightsLoading && !blockTypesLoading) {
      setInitialLoading(false);
    }
  }, [insightsLoading, blockTypesLoading]);

  React.useEffect(() => {
    if (user?.id) {
      fetchUserInsights(user.id);
      refreshBlockTypes();
    }
    // Optionally, clear context if user logs out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const getBlockTypeName = (blockTypeId: string): string => {
    const blockType = blockTypes.find((bt: BlockType) => bt.id === blockTypeId);
    return blockType ? `${blockType.emoji} ${blockType.name}` : blockTypeId;
  };

  if (initialLoading) {
    return <Loading text="Loading your insights..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (insights.length === 0) {
    return <EmptyInsightsState />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-liminal-overlay min-h-screen">
      <div className="text-center mb-8">
        <div className="mb-4">
          <img src={robEmoji} alt="Rob" className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Your Insight History
        </h1>
        <p className="text-accent">
          {insights.length} insight{insights.length !== 1 ? 's' : ''} with Rob
          the Duck
        </p>
      </div>

      <div className={`space-y-6 p-6 ${insightPanelClass}`}>
        {insights.map((insight) => {
          return (
            <div
              key={insight.id}
              className="p-6 bg-liminal-overlay border-l-4 border-liminal-border rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <InsightHeader
                    spreadType={insight.spread_type}
                    createdAt={insight.created_at}
                    onView={() => navigate(`/insights/${insight.id}`)}
                  />
                  <h3 className="text-lg font-semibold text-secondary mb-1">
                    {getBlockTypeName(insight.block_type_id)}
                  </h3>
                  {insight.user_context && (
                    <p className="text-secondary text-sm">
                      "{insight.user_context}"
                    </p>
                  )}

                  {insight.reading.keyInsights && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl" role="img" aria-label="key">
                          🔑
                        </span>
                        <span className="text-xs text-primary uppercase tracking-wide font-bold">
                          Key Insights
                        </span>
                      </div>
                      <ul className="space-y-2 bullet-list">
                        {insight.reading.keyInsights.map(
                          (keyInsight: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span className="text-secondary text-sm">
                                {keyInsight}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {insight.cards_drawn.map(
                  (
                    cardData: { id: number; reversed: boolean },
                    index: number
                  ) => {
                    const card = cards.find((c) => c.id === cardData.id);
                    if (!card) return null;
                    return (
                      <InsightCardPreview
                        key={`${insight.id}-${card.id}-${index}`}
                        card={card}
                        reversed={cardData.reversed}
                        onClick={() => navigate(`/insights/${insight.id}`)}
                        label={`View insight for ${card.name}`}
                      />
                    );
                  }
                )}
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
          Get Another Insight
        </Link>
      </div>
    </div>
  );
};

const EmptyInsightsState = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="max-w-3xl w-full mx-auto bg-surface p-8 rounded-xl border border-liminal-border shadow-lg">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 rounded-full flex items-center justify-center shadow-glow mb-2">
              <img src={robEmoji} alt="Rob" className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              Your Insight Archive is Empty
            </h2>
            <p className="text-secondary mb-2">
              <strong>Rob here.</strong> I'm floating around in the ethereal
              realm with zero debugging sessions logged. That's either
              impressive life management or serious avoidance behavior.
            </p>
            <p className="text-secondary mb-6 font-medium">
              Let's fix that. What's blocking you right now?
            </p>
            <Link
              to="/new-insight"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Get your first insight
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';

interface InsightCardPreviewProps {
  card: { id: number; emoji: string; name: string };
  reversed: boolean;
  onClick: () => void;
  label: string;
}

const InsightCardPreview: React.FC<InsightCardPreviewProps> = ({
  card,
  reversed,
  onClick,
  label,
}) => {
  return (
    <div
      className={cn(
        'relative flex-1 bg-void-gradient border border-default shadow-breakthrough border-liminal-border rounded-lg p-3 text-center cursor-pointer',
        'hover:scale-[1.03] hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
        'active:scale-[0.98]'
      )}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <div className={cn('text-2xl mb-1', reversed && 'transform rotate-180')}>
        {card.emoji}
      </div>
      <div className="text-sm font-medium text-secondary">
        {card.name}
        {reversed && <span className="text-xs text-accent ml-1">(R)</span>}
      </div>
      <div className="absolute top-2 right-2 opacity-70 pointer-events-none">
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 18l6-6-6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// --- Subcomponent for insight header ---

interface InsightHeaderProps {
  spreadType: string;
  createdAt: string | number | Date;
  onView: () => void;
}

const InsightHeader: React.FC<InsightHeaderProps> = ({
  spreadType,
  createdAt,
  onView,
}) => {
  return (
    <div className="flex items-center gap-2 mb-2 relative">
      <span className="text-sm font-medium text-primary bg-liminal-overlay px-2 py-1 rounded">
        {spreadType === 'quick-draw' ? 'Quick Draw' : 'Full Pond'}
      </span>
      <span className="text-sm text-secondary">
        {typeof createdAt === 'string' || typeof createdAt === 'number'
          ? new Date(createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
      </span>
      <button
        className={cn(
          'ml-auto px-3 py-2 text-xs font-semibold rounded border',
          'border-accent bg-void-gradient text-secondary',
          'hover:bg-liminal-overlay hover:text-primary',
          'transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
          'active:scale-[0.98]',
          'hover:scale-[1.03] hover:shadow-lg',
          'cursor-pointer'
        )}
        onClick={onView}
        tabIndex={0}
        aria-label="View Insight"
      >
        View Insight <ArrowRight className="inline ml-1 size-4" />
      </button>
    </div>
  );
};

export default Insights;
