import { useState, useEffect } from 'react';
import TextArea from '../components/TextArea';
import { Listbox } from '@headlessui/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useCards from '../lib/cards/useCards';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import useAuth from '../lib/hooks/useAuth';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import {
  ArrowLeft,
  Lightbulb,
  Heart,
  Briefcase,
  Users,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';
import robEmoji from '../assets/rob-emoji.png';
import { type Card } from '@/src/interfaces';
import { type User } from '@/src/interfaces';
import { type ReactElement } from 'react';
import getAdviceForUser from '../lib/user/get-advice-for-user';

const PublicCardContent = ({
  card,
  getBlockTypeIcon,
  getBlockTypeName,
}: {
  card: Card;
  getBlockTypeIcon: (blockId: string) => ReactElement;
  getBlockTypeName: (blockId: string) => string;
}) => {
  return (
    <>
      <div
        id="public-card-banner"
        className="bg-gradient-to-r from-breakthrough-500/20 to-accent/20 border border-breakthrough-500/30 rounded-xl p-6 mb-6 text-center"
      >
        <h2 className="text-2xl font-semibold text-primary mb-3">
          This card doesn't know you yet
        </h2>
        <p className="text-secondary mb-4 max-w-2xl mx-auto">
          Right now you're getting generic rubber duck wisdom. Create an account
          and Rob starts learning your specific brand of getting stuck; then
          watch his advice get uncomfortably accurate.
        </p>
        <Link
          to="/pricing"
          className="inline-block bg-breakthrough-400 text-void-900 px-6 py-3 rounded-lg font-semibold hover:bg-breakthrough-300 transition-colors"
        >
          <span className="ml-2 text-sm ">Teach Rob About You</span>
        </Link>
      </div>

      {/* Block Applications */}
      <div className="bg-surface rounded-xl border border-liminal-border p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(card.block_applications).map(([blockId, advice]) => (
            <div
              key={blockId}
              className="bg-liminal-surface rounded-lg p-4 border border-liminal-border"
            >
              <div className="flex items-center gap-2 mb-3 text-accent">
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
            Rob's Take
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
        <br />
        <div className="text-xs text-secondary bg-liminal-surface p-4 rounded-lg">
          💡 These tags connect to your reading themes. Click any tag to explore
          related cards in your personalized library.
        </div>
      </div>
    </>
  );
};

// Local subcomponent for interactive reflection questions (collapsible)
const ReflectionQuestions = ({
  prompts,
  blockTypeIds,
  getBlockTypeName,
}: {
  prompts: string[];
  blockTypeIds: string[];
  getBlockTypeName: (id: string) => string;
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const toggle = () => setExpanded((prev) => !prev);

  return (
    <div className="bg-surface rounded-xl border border-liminal-border p-6 mb-6">
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full text-left focus:outline-none"
      >
        <h2 className="text-2xl font-semibold text-primary">
          <span className="text-primary">Your Thoughts</span>
        </h2>
        <ChevronDown
          className={`w-5 h-5 text-secondary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="space-y-4 mt-4">
          {prompts.map((prompt, index) => (
            <ReflectionItem
              key={index}
              index={index}
              prompt={prompt}
              blockTypeIds={blockTypeIds}
              getBlockTypeName={getBlockTypeName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Individual reflection question with block type selector
const ReflectionItem = ({
  index,
  prompt,
  blockTypeIds,
  getBlockTypeName,
}: {
  index: number;
  prompt: string;
  blockTypeIds: string[];
  getBlockTypeName: (id: string) => string;
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  return (
    <div className="bg-liminal-surface rounded-lg p-4 border border-liminal-border">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-accent font-semibold mt-1">{index + 1}.</span>
        <p className="text-secondary leading-relaxed flex-1">{prompt}</p>
      </div>
      <div className="ml-6 space-y-2">
        <TextArea
          placeholder="Write your thoughts here... (saved automatically)"
          rows={2}
        />
        <BlockTypeSelect
          blockTypeIds={blockTypeIds}
          selected={selectedBlock}
          onChange={setSelectedBlock}
          getBlockTypeName={getBlockTypeName}
        />
      </div>
    </div>
  );
};

// Dropdown selector component using Headless UI Listbox
const BlockTypeSelect = ({
  blockTypeIds,
  selected,
  onChange,
  getBlockTypeName,
}: {
  blockTypeIds: string[];
  selected: string;
  onChange: (val: string) => void;
  getBlockTypeName: (id: string) => string;
}) => {
  return (
    <Listbox value={selected} onChange={onChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className="w-full bg-void-800 border border-liminal-border text-secondary text-sm rounded-lg p-2 text-left">
            {selected ? getBlockTypeName(selected) : 'Select block type…'}
          </Listbox.Button>
          {open && (
            <Listbox.Options className="absolute mt-1 w-full bg-void-900 border border-liminal-border rounded-lg z-10 max-h-60 overflow-auto text-sm">
              <Listbox.Option
                value=""
                disabled
                className="cursor-default px-3 py-2 text-secondary/60"
              >
                Select block type…
              </Listbox.Option>
              {blockTypeIds.map((id) => (
                <Listbox.Option
                  key={id}
                  value={id}
                  className={({ active }) =>
                    `cursor-pointer px-3 py-2 ${active ? 'bg-accent/20' : ''}`
                  }
                >
                  {getBlockTypeName(id)}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          )}
        </div>
      )}
    </Listbox>
  );
};
const PersonalizedCardContent = ({
  card,
  user,
  getBlockTypeIcon,
  getBlockTypeName,
}: {
  card: Card;
  user: User;
  getBlockTypeIcon: (blockId: string) => ReactElement;
  getBlockTypeName: (blockId: string) => string;
}) => {
  const [blockAdvice, setBlockAdvice] = useState<Record<string, string>>({});
  // Banner visibility state (persisted in localStorage)
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true; // SSR safeguard
    return localStorage.getItem('adaptiveCardBannerDismissed') !== 'true';
  });

  const dismissBanner = () => {
    localStorage.setItem('adaptiveCardBannerDismissed', 'true');
    setShowBanner(false);
  };
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoading(true);
      try {
        const blockTypes = Object.keys(card.block_applications);
        const advicePromises = blockTypes.map(async (blockType) => {
          const advice = await getAdviceForUser(card, blockType, user);
          return { blockType, advice };
        });

        const results = await Promise.all(advicePromises);
        const adviceMap = results.reduce(
          (acc, { blockType, advice }) => {
            acc[blockType] = advice;
            return acc;
          },
          {} as Record<string, string>
        );

        setBlockAdvice(adviceMap);
      } catch (error) {
        console.error('Error fetching advice:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, [card, user]);

  if (loading) {
    return <Loading text="Loading personalized guidance..." />;
  }

  return (
    <>
      {/* User-specific insights banner (dismissable) */}
      {showBanner && (
        <div
          id="user-specific-insights-banner"
          className="relative bg-gradient-to-r from-breakthrough-500/10 to-accent/10 border border-breakthrough-500/30 rounded-xl p-6 mb-6"
        >
          {/* Dismiss button */}
          <button
            onClick={dismissBanner}
            aria-label="Dismiss banner"
            className="absolute top-3 right-3 text-breakthrough-300 hover:text-breakthrough-200"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-breakthrough-300" />
            <h2 className="text-2xl font-semibold text-breakthrough-300">
              Your Adaptive Card Experience
            </h2>
          </div>
          <p className="text-primary text-lg leading-relaxed">
            Rob remembers you now, which means he can stop being polite and
            start being useful. This card is customized for your specific flavor
            of chaos.
          </p>
        </div>
      )}

      {/* Personalized Block Guidance */}
      <div className="bg-surface rounded-xl border border-liminal-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-semibold text-primary">
            Personalized Guidance
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(card.block_applications).map(
            ([blockId, fallbackAdvice]) => (
              <div
                key={blockId}
                className="bg-gradient-to-br from-liminal-surface to-liminal-surface/50 rounded-lg p-4 border border-breakthrough-500/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  {getBlockTypeIcon(blockId)}
                  <h3 className="font-semibold text-accent">
                    {getBlockTypeName(blockId)}
                  </h3>
                </div>
                <p className="text-secondary text-sm leading-relaxed">
                  {blockAdvice[blockId] || fallbackAdvice}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Enhanced Rob's Wisdom */}
      <div className="bg-breakthrough-500/10 border border-breakthrough-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={robEmoji} alt="Rob" className="w-8 h-8" />
          <h2 className="text-2xl font-semibold text-breakthrough-300">
            Rob's Take
          </h2>
        </div>
        {/* TODO: Generate Rob's take */}
        <p className="text-primary italic text-lg leading-relaxed mb-4">
          "{card.duck_wisdom}"
        </p>
      </div>

      {/* Interactive Reflection Questions */}
      <ReflectionQuestions
        prompts={card.perspective_prompts.slice(0, 3)}
        blockTypeIds={Object.keys(card.block_applications)}
        getBlockTypeName={getBlockTypeName}
      />

      {/* Enhanced Tags with Personalization */}
      <div className="bg-surface rounded-xl border border-liminal-border p-6 mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Tags & Your Connections
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {card.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

const CardDetail = () => {
  const { cardName } = useParams<{ cardName: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cards, loading: cardsLoading, error: cardsError } = useCards();
  const {
    blockTypes,
    loading: blockTypesLoading,
    error: blockTypesError,
  } = useBlockTypes();

  const loading = cardsLoading || blockTypesLoading || authLoading;
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

      {/* Conditional content based on auth state */}
      {user ? (
        <PersonalizedCardContent
          card={card}
          user={user}
          getBlockTypeIcon={getBlockTypeIcon}
          getBlockTypeName={getBlockTypeName}
        />
      ) : (
        <PublicCardContent
          card={card}
          getBlockTypeIcon={getBlockTypeIcon}
          getBlockTypeName={getBlockTypeName}
        />
      )}

      {/* Action Buttons */}
      <div className="text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        {user && (
          <Link
            to="/new-insight"
            className="block sm:inline-block bg-breakthrough-400 text-void-900 px-6 py-3 rounded-lg font-semibold hover:bg-breakthrough-300 transition-colors"
          >
            Get an Insight with This Card
          </Link>
        )}
        <Link
          to="/cards"
          className="block sm:inline-block border-2 border-accent text-accent px-6 py-3 rounded-lg font-semibold hover:bg-accent hover:text-void-900 transition-colors"
        >
          {user ? 'Explore More Cards' : 'Back to Cards'}
        </Link>
        {!user && (
          <Link
            to="/pricing"
            className="block sm:inline-block border-2 border-accent text-accent px-6 py-3 rounded-lg font-semibold hover:bg-accent hover:text-void-900 transition-colors"
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
};

export default CardDetail;
