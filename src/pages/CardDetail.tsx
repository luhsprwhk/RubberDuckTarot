import { useParams, Link, useNavigate } from 'react-router-dom';
import useCards from '../lib/cards/useCards';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import {
  ArrowLeft,
  Lightbulb,
  Heart,
  Briefcase,
  Users,
  Sparkles,
} from 'lucide-react';
import robEmoji from '../assets/rob-emoji.png';

const CardDetail = () => {
  const { cardName } = useParams<{ cardName: string }>();
  const navigate = useNavigate();
  const { cards, loading: cardsLoading, error: cardsError } = useCards();
  const {
    blockTypes,
    loading: blockTypesLoading,
    error: blockTypesError,
  } = useBlockTypes();

  const loading = cardsLoading || blockTypesLoading;
  const error = cardsError || blockTypesError;

  if (loading) return <Loading text="Loading card details..." />;
  if (error) return <ErrorState error={error} />;

  const createCardSlug = (cardName: string) => {
    return cardName.toLowerCase().replace(/\s+/g, '-');
  };

  const card = cards.find((c) => createCardSlug(c.name) === cardName);

  if (!card) {
    return <ErrorState error="Card not found" homeLinkText="View All Cards" />;
  }

  const getBlockTypeIcon = (blockId: string) => {
    switch (blockId) {
      case 'creative':
        return <Lightbulb className="w-5 h-5" />;
      case 'work':
        return <Briefcase className="w-5 h-5" />;
      case 'life':
        return <Heart className="w-5 h-5" />;
      case 'relationship':
        return <Users className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getBlockTypeName = (blockId: string) => {
    const blockType = blockTypes.find((bt) => bt.id === blockId);
    return (
      blockType?.name || blockId.charAt(0).toUpperCase() + blockId.slice(1)
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/cards')}
          className="flex items-center gap-2 text-secondary hover:text-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cards
        </button>

        <div className="text-center">
          <div className="text-8xl mb-4">{card.emoji}</div>
          <h1 className="text-4xl font-bold text-primary mb-2">{card.name}</h1>
          <p className="text-accent text-lg">
            {card.duck_question && `"${card.duck_question}"`}
          </p>
        </div>
      </div>

      {/* Block Applications */}
      <div className="bg-surface rounded-xl border border-liminal-border p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(card.block_applications).map(([blockId, advice]) => (
            <div
              key={blockId}
              className="bg-liminal-surface rounded-lg p-4 border border-liminal-border"
            >
              <div className="flex items-center gap-2 mb-3">
                {getBlockTypeIcon(blockId)}
                <h3 className="font-semibold text-accent">
                  {getBlockTypeName(blockId)}
                </h3>
              </div>
              <p className="text-secondary text-sm leading-relaxed">{advice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rob's Wisdom */}
      <div className="bg-breakthrough-500/10 border border-breakthrough-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={robEmoji} alt="Rob" className="w-8 h-8" />
          <h2 className="text-2xl font-semibold text-breakthrough-300">
            Rob's Debugging Wisdom
          </h2>
        </div>
        <p className="text-primary italic text-lg leading-relaxed">
          "{card.duck_wisdom}"
        </p>
      </div>

      {/* Perspective Prompts */}
      <div className="bg-surface rounded-xl border border-liminal-border p-6 mb-6">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Reflection Questions
        </h2>
        <div className="space-y-3">
          {card.perspective_prompts.slice(0, 3).map((prompt, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-accent font-semibold mt-1">
                {index + 1}.
              </span>
              <p className="text-secondary leading-relaxed">{prompt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-surface rounded-xl border border-liminal-border p-6 mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full border border-accent/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <Link
          to="/new-reading"
          className="block sm:inline-block bg-breakthrough-400 text-void-900 px-6 py-3 rounded-lg font-semibold hover:bg-breakthrough-300 transition-colors"
        >
          Get an Insight with This Card
        </Link>
        <Link
          to="/cards"
          className="block sm:inline-block border-2 border-accent text-accent px-6 py-3 rounded-lg font-semibold hover:bg-accent hover:text-void-900 transition-colors"
        >
          Explore More Cards
        </Link>
      </div>
    </div>
  );
};

export default CardDetail;
