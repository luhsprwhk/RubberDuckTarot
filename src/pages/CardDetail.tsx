import { useState, useEffect, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
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
import { getUserBlocks } from '../lib/blocks/block-queries';
import generateRobsTake from '../ai/generate_robs_take';
import { getInsightsByUser } from '../lib/insights/insight-queries';
import {
  saveReflection,
  getReflectionByUserCardPrompt,
} from '../lib/reflections/reflection-queries';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'CardDetail Error Boundary caught an error:',
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorState
            error={this.state.error?.message || 'An unexpected error occurred'}
          />
        )
      );
    }

    return this.props.children;
  }
}

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
          Reflect on These
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
  card,
  user,
}: {
  prompts: string[];
  blockTypeIds: string[];
  getBlockTypeName: (id: string) => string;
  card: Card;
  user: User;
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const toggle = () => setExpanded((prev) => !prev);

  return (
    <div className="bg-surface rounded-xl border border-liminal-border p-6 mb-6">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center justify-between w-full text-left focus:outline-none"
      >
        <h2 className="text-2xl font-semibold text-primary">
          <span className="text-primary">Reflect on These</span>
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
              card={card}
              user={user}
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
  card,
  user,
}: {
  index: number;
  prompt: string;
  blockTypeIds: string[];
  getBlockTypeName: (id: string) => string;
  card: Card;
  user: User;
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [reflectionText, setReflectionText] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Load existing reflection on mount
  useEffect(() => {
    const loadReflection = async () => {
      try {
        const existing = await getReflectionByUserCardPrompt(
          user.id,
          card.id,
          index
        );
        if (existing) {
          setReflectionText(existing.reflection_text);
          setSelectedBlock(existing.block_type_id || '');
        }
      } catch (error) {
        console.error('Error loading reflection:', error);
        // Silently fail to allow the component to render
      }
    };
    loadReflection();
  }, [user.id, card.id, index]);

  // Auto-save reflection text with debounce
  useEffect(() => {
    if (!reflectionText.trim()) return;

    const timeoutId = setTimeout(async () => {
      try {
        setSaving(true);
        await saveReflection(
          user.id,
          card.id,
          index,
          reflectionText,
          selectedBlock || undefined
        );
      } catch (error) {
        console.error('Error saving reflection:', error);
        // Don't prevent the component from continuing to work
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [reflectionText, selectedBlock, user.id, card.id, index]);

  return (
    <div className="bg-liminal-surface rounded-lg p-4 border border-liminal-border">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-accent font-semibold mt-1">{index + 1}.</span>
        <p className="text-secondary leading-relaxed flex-1">{prompt}</p>
      </div>
      <div className="ml-6 space-y-2">
        <div className="relative">
          <TextArea
            placeholder="Write your thoughts here... (saved automatically)"
            rows={2}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
          />
          {saving && (
            <div className="absolute top-2 right-2 text-xs text-secondary">
              Saving...
            </div>
          )}
        </div>
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
  const [hasInsightsForCard, setHasInsightsForCard] = useState<boolean>(true);
  const [robsTake, setRobsTake] = useState<string>('');
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
        // First check if the user has any insights involving this card
        const userInsights = await getInsightsByUser(user.id);
        const cardHasInsights = userInsights.some((insight) =>
          insight.cards_drawn?.some((c) => c.id === card.id)
        );

        if (!cardHasInsights) {
          setHasInsightsForCard(false);
          return;
        }

        setHasInsightsForCard(true);

        const blockTypes = Object.keys(card.block_applications);
        const userBlocks = await getUserBlocks(user.id);
        const relevantBlocks = userBlocks.filter((block) =>
          blockTypes.includes(block.block_type_id)
        );

        // Fetch block advice and Rob's take in parallel
        const [adviceResults, robsTakeResult] = await Promise.all([
          Promise.all(
            relevantBlocks.map(async (block) => {
              try {
                const advice = await getAdviceForUser(
                  card,
                  block.block_type_id,
                  user
                );
                return { blockType: block.block_type_id, advice };
              } catch (error) {
                console.error(
                  `Error fetching advice for block ${block.block_type_id}:`,
                  error
                );
                return {
                  blockType: block.block_type_id,
                  advice:
                    card.block_applications[
                      block.block_type_id as keyof typeof card.block_applications
                    ] || '',
                };
              }
            })
          ),
          generateRobsTake(card, user).catch((error) => {
            console.error("Error generating Rob's take:", error);
            return card.duck_wisdom; // Fallback to default wisdom
          }),
        ]);

        const adviceMap = adviceResults.reduce(
          (acc, { blockType, advice }) => {
            acc[blockType] = advice;
            return acc;
          },
          {} as Record<string, string>
        );

        setBlockAdvice(adviceMap);
        setRobsTake(robsTakeResult);
      } catch (error) {
        console.error('Error fetching advice:', error);
        // Set fallback state to prevent blank page
        setHasInsightsForCard(true);
        setBlockAdvice({});
        setRobsTake(card.duck_wisdom);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, [card, user]);

  if (loading) {
    return <Loading text="Loading personalized guidance..." />;
  }

  if (!hasInsightsForCard) {
    return (
      <div className="bg-surface rounded-xl border border-liminal-border p-6 text-center">
        <p className="text-secondary">
          No insights from this card yet. Draw it in a reading to unlock
          personalized guidance.
        </p>
      </div>
    );
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
          {Object.entries(card.block_applications)
            .filter(([blockId]) => blockId in blockAdvice)
            .map(([blockId, fallbackAdvice]) => (
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
            ))}
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
        <p className="text-primary italic text-lg leading-relaxed mb-4">
          "{robsTake || card.duck_wisdom}"
        </p>
      </div>

      {/* Interactive Reflection Questions */}
      <ErrorBoundary>
        <ReflectionQuestions
          prompts={card.perspective_prompts.slice(0, 3)}
          blockTypeIds={Object.keys(card.block_applications)}
          getBlockTypeName={getBlockTypeName}
          card={card}
          user={user}
        />
      </ErrorBoundary>

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
        <ErrorBoundary
          fallback={
            <PublicCardContent
              card={card}
              getBlockTypeIcon={getBlockTypeIcon}
              getBlockTypeName={getBlockTypeName}
            />
          }
        >
          <PersonalizedCardContent
            card={card}
            user={user}
            getBlockTypeIcon={getBlockTypeIcon}
            getBlockTypeName={getBlockTypeName}
          />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>
          <PublicCardContent
            card={card}
            getBlockTypeIcon={getBlockTypeIcon}
            getBlockTypeName={getBlockTypeName}
          />
        </ErrorBoundary>
      )}

      {/* Action Buttons */}
      <div className="text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mt-6">
        {user && (
          <Link
            to={`/new-insight?cardId=${card.id}`}
            state={{ cardId: card.id }}
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
