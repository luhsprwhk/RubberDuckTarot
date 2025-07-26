import React, { useEffect, useState } from 'react';
import { drawCard } from '../lib/drawCard';
type FlatDrawnCard = import('../interfaces').Card & { reversed: boolean };
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../lib/userPreferences';
import useAuth from '../lib/hooks/useAuth';
import useCards from '../lib/cards/useCards';
import type { BlockType } from '../interfaces';
import { createInsight } from '../lib/insights/insight-queries';
import type { UserBlock } from '../interfaces';
import {
  generateInsight,
  generateUserBlockName,
  type PersonalizedReading,
} from '../ai';
import { createUserBlock, getUserBlockById } from '../lib/blocks/block-queries';
import { type UserProfile } from '../interfaces';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import duckCodingMP4 from '../assets/wiz-duck-coding.mp4';
import duckCardCatchMP4 from '../assets/duck-card-catch.mp4';
import retroRobMP4 from '../assets/retro-rob.mp4';
import magic8BallMP4 from '../assets/magic-8-ball-rob.mp4';
import ErrorState from '../components/ErrorState';

// Occult/astral humor loading messages (shared across component instances)
const astralMessagesBase = [
  'Consulting the Akashic records',
  'Casting minor divinations',
  'Summoning the spirit of insight',
  'Shuffling the cosmic deck',
  'Peering through the veil',
  'Reading tea leaves in zero gravity',
  'Negotiating with astral bureaucrats',
  'Aligning the quantum tarot',
  'Waiting for the stars to answer',
  'Translating celestial whispers',
  'Contacting your higher duck',
  'Sacrificing RAM to the algorithm',
  'Unraveling the threads of fate',
  'Dowsing for digital wisdom',
  'Charging the insight crystals',
  'Decoding the cosmic punchline',
  // Extra fun!
  'Syncing with cosmic Wi-Fi',
  'Rolling dice for destiny',
  'Tuning the astral radio',
  'Polishing the crystal ball',
  'Debugging the matrix',
  'Feeding ducks breadcrumbs of truth',
  'Recalibrating karmic scales',
  'Loading spirit emojis',
  'Compiling stardust shaders',
  'Bargaining with quantum quacks',
];

// Use MP4 videos instead of GIFs for better performance
const duckVideos = [
  duckCodingMP4,
  duckCardCatchMP4,
  retroRobMP4,
  magic8BallMP4,
];

interface ReadingState {
  selectedBlockTypeId: string;
  spreadType: 'quick-draw' | 'full-pond';
  userContext?: string;
  existingUserBlockId?: number; // If adding insight to existing block
  selectedCardId?: number; // If adding specific card to insight
}

const CreateInsight: React.FC = () => {
  const { user } = useAuth();
  const { blockTypes } = useBlockTypes();
  const { cards, loading: cardsLoading, error: cardsError } = useCards();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReadingState | null;
  const {
    spreadType,
    selectedBlockTypeId,
    userContext = '',
    existingUserBlockId,
    selectedCardId,
  } = state || {};

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [drawnCards, setDrawnCards] = useState<FlatDrawnCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<BlockType | null>(null);
  const [personalizedReading, setPersonalizedReading] =
    useState<PersonalizedReading | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);

  // Occult/astral humor loading messages
  // (shuffled fresh for each reading)

  // Fisher-Yates shuffle helper
  const shuffle = <T,>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Shuffled list used for the current reading
  const [astralMessages, setAstralMessages] = useState<string[]>(() =>
    shuffle([...astralMessagesBase])
  );
  const [astralIndex, setAstralIndex] = useState(0);

  // Reshuffle and rotate messages for each reading
  useEffect(() => {
    if (!loadingReading) return;

    // Reshuffle for a fresh order & reset index
    setAstralMessages(shuffle([...astralMessagesBase]));
    setAstralIndex(0);

    const interval = setInterval(() => {
      setAstralIndex((i) => (i + 1) % astralMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loadingReading, astralMessages.length]);

  // readingError: false means no error, string means error message
  const [readingError, setReadingError] = useState<string | false>(false);

  const [currentBlock, setCurrentBlock] = useState<UserBlock | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDataAndDrawCards = async () => {
      if (!user || !spreadType || cardsLoading) {
        setIsDrawing(false);
        return;
      }

      if (cards.length === 0) {
        if (!cardsLoading && !cardsError) {
          console.error('No cards available');
        }

        setIsDrawing(false);
        return;
      }

      setIsDrawing(true);
      setDrawnCards([]);

      try {
        const profile = await getUserProfile(user.id);

        if (!isMounted) {
          return;
        }
        setUserProfile(profile);

        let blockType: BlockType | null = null;
        let userBlock: UserBlock | null = null;

        if (existingUserBlockId) {
          userBlock = await getUserBlockById(existingUserBlockId);

          if (userBlock) {
            blockType =
              blockTypes.find((bt) => bt.id === userBlock?.block_type_id) ??
              null;
            if (isMounted) {
              setCurrentBlock(userBlock);
            }
          }
        } else if (selectedBlockTypeId) {
          blockType =
            blockTypes.find((bt) => bt.id === selectedBlockTypeId) ?? null;
        }

        if (!blockType) {
          if (isMounted) {
            setSelectedBlock(null);
            setReadingError(
              'No valid block type found. Please select or create a block type.'
            );
          }

          setIsDrawing(false);
          return;
        }

        if (isMounted) {
          setSelectedBlock(blockType);
        }

        // If a specific card was selected (e.g., from CardDetail), skip random drawing
        if (selectedCardId) {
          const chosen = cards.find((c) => c.id === selectedCardId);
          if (chosen) {
            if (isMounted) {
              setDrawnCards([{ ...chosen, reversed: false }]);
            }
            // No need to randomly draw — proceed to reading generation
            return;
          }
        }

        const numCardsToDraw = spreadType === 'quick-draw' ? 1 : 3;
        const availableCards = [...cards];
        const drawnCardsList = [];

        for (let i = 0; i < numCardsToDraw; i++) {
          const drawn = drawCard(availableCards);

          if (!drawn) break;
          // Flatten the drawn card: merge all card properties + reversed
          drawnCardsList.push({ ...drawn.card, reversed: drawn.reversed });
        }

        if (isMounted) {
          setDrawnCards(drawnCardsList);
        }

        // (Handled above: previous insights for existing block)
      } catch (error) {
        console.error('An error occurred during data fetching:', error);
      } finally {
        if (isMounted) {
          setIsDrawing(false);
        }
      }
    };

    fetchDataAndDrawCards();

    return () => {
      isMounted = false;
    };
  }, [
    user,
    spreadType,
    selectedBlockTypeId,
    cards,
    cardsLoading,
    cardsError,
    blockTypes,
    existingUserBlockId,
    selectedCardId,
  ]);

  useEffect(() => {
    const generateInsightAndSave = async () => {
      if (
        !isDrawing &&
        drawnCards.length > 0 &&
        selectedBlock &&
        userProfile &&
        !personalizedReading &&
        (spreadType === 'quick-draw' || spreadType === 'full-pond')
      ) {
        setLoadingReading(true);
        setReadingError(false);
        try {
          const reading = await generateInsight({
            cards: drawnCards,
            blockType: selectedBlock,
            userContext: userContext || '',
            userProfile,
            spreadType,
            previousInsights: undefined,
            currentBlock: currentBlock || undefined,
          });
          setPersonalizedReading(reading);

          // Use existing block or create new one
          let userBlockId = existingUserBlockId;

          if (!userBlockId) {
            const userBlockPayload = {
              user_id: user?.id ?? null,
              block_type_id: selectedBlock?.id ?? null,
              name: await generateUserBlockName(
                selectedBlock?.name,
                userContext
              ),
              status: 'active',
              notes: null,
              resolution_reflection: null,
            };

            const userBlock = await createUserBlock(userBlockPayload);
            userBlockId = userBlock.id;
          }

          const insight = await createInsight({
            user_id: user?.id ?? null,
            spread_type: spreadType,
            block_type_id: selectedBlock?.id ?? null,
            user_context: userContext ?? null,
            cards_drawn: drawnCards.map((dc) => ({
              id: dc.id,
              reversed: dc.reversed,
            })),
            resonated: false,
            took_action: false,
            reading,
            user_block_id: userBlockId,
          });

          setLoadingReading(false); // Move before navigate
          console.log(
            '[generateInsightAndSave] Navigating to insight',
            insight.id
          );
          navigate(`/insights/${insight.id}`, {
            state: {
              spreadType,
            },
          });
          console.log('[generateInsightAndSave] Navigation called');
        } catch (error) {
          console.error('Failed to generate personalized reading:', error);
          if (error instanceof Error && error.message) {
            console.error('Error message:', error.message);
          }
          setReadingError(
            error instanceof Error ? error.message : String(error)
          );
        } finally {
          setLoadingReading(false);
        }
      }
    };

    generateInsightAndSave();
  }, [
    isDrawing,
    drawnCards,
    selectedBlock,
    userProfile,
    userContext,
    spreadType,
    user?.id,
    navigate,
    existingUserBlockId,
    currentBlock,
    personalizedReading,
  ]);

  const handleReset = () => {
    navigate('/');
  };

  // Pick a random duck video for the loader on mount
  const loadingVideo = React.useMemo(() => {
    return duckVideos[Math.floor(Math.random() * duckVideos.length)];
  }, []);

  // Always show the loading video at the top
  const renderLoader = () => (
    <div className="flex flex-col items-center mb-6">
      {loadingVideo && (
        <video autoPlay loop muted className="mb-4 max-w-xs" playsInline>
          <source src={loadingVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
    </div>
  );

  // Determine loading text
  let loadingText = '';
  if (cardsLoading) {
    loadingText = 'Rob is preparing the deck...';
  } else if (isDrawing) {
    loadingText = 'Rob is shuffling the deck...';
  } else if (loadingReading) {
    // Show 3 rotating messages for flavor
    const msgCount = 3;
    const indices = Array.from(
      { length: msgCount },
      (_, idx) => (astralIndex + idx) % astralMessages.length
    );
    loadingText = indices.map((i) => astralMessages[i]).join('\n');
  }

  if (cardsLoading || isDrawing || loadingReading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-void-gradient min-h-screen flex items-center justify-center">
        <div className="text-center w-full">
          {renderLoader()}
          {loadingReading && Array.isArray(loadingText.split('\n')) ? (
            <div className="flex flex-col items-center gap-1 mb-2">
              {loadingText.split('\n').map((msg, idx) => {
                if (idx === 1) {
                  // Middle message: bold, big, primary
                  return (
                    <div
                      key={msg}
                      className="text-xl font-bold text-primary leading-snug"
                    >
                      {msg}
                    </div>
                  );
                } else {
                  // Top/bottom: small, muted
                  return (
                    <div
                      key={msg}
                      className="text-sm text-secondary opacity-70"
                    >
                      {msg}
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            loadingText && (
              <div className="text-lg text-primary font-semibold whitespace-pre-line">
                {loadingText}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (readingError) {
    return (
      <ErrorState
        error={
          typeof readingError === 'string'
            ? readingError
            : 'Failed to generate reading'
        }
        homeLinkText="Go to Home Page"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-red-500 mb-4">
        Something went wrong. Please try again.
      </p>
      <button onClick={handleReset} className="text-blue-500 hover:underline">
        Please try again
      </button>
    </div>
  );
};

export default CreateInsight;
