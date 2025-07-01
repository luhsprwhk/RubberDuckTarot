import React, { useEffect, useState } from 'react';
import { drawCard } from '../lib/drawCard';
type FlatDrawnCard = import('../interfaces').Card & { reversed: boolean };
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../lib/userPreferences';
import useAuth from '../lib/hooks/useAuth';
import useCards from '../lib/cards/useCards';
import type { BlockType } from '../interfaces';
import { createInsight } from '../lib/insights/insight-queries';
import {
  generatePersonalizedReading,
  generateUserBlockName,
  type PersonalizedReading,
} from '../lib/claude-ai';
import { createUserBlock } from '../lib/blocks/block-queries';
import { type UserProfile } from '../interfaces';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import duckCodingGIF from '../assets/wiz-duck-coding.gif';
import duckCardCatchGIF from '../assets/duck-card-catch.gif';
import ErrorState from '../components/ErrorState';

// Add more duck GIFs here if available
const duckGifs = [duckCodingGIF, duckCardCatchGIF];

interface ReadingState {
  selectedBlockTypeId: string;
  spreadType: 'quick-draw' | 'full-pond';
  userContext?: string;
}

const Reading: React.FC = () => {
  const { user } = useAuth();
  const { blockTypes } = useBlockTypes();
  const { cards, loading: cardsLoading, error: cardsError } = useCards();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReadingState | null;
  const { spreadType, selectedBlockTypeId, userContext = '' } = state || {};

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [drawnCards, setDrawnCards] = useState<FlatDrawnCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<BlockType | null>(null);
  const [personalizedReading, setPersonalizedReading] =
    useState<PersonalizedReading | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const [readingError, setReadingError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDataAndDrawCards = async () => {
      if (!user || !spreadType || !selectedBlockTypeId || cardsLoading) {
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
        if (!isMounted) return;
        setUserProfile(profile);

        const block = blockTypes.find((bt) => bt.id === selectedBlockTypeId);
        if (!isMounted) return;
        setSelectedBlock(block ?? null);

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
  ]);

  useEffect(() => {
    const generateReading = async () => {
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
          const reading = await generatePersonalizedReading({
            cards: drawnCards,
            blockType: selectedBlock,
            userContext: userContext || '',
            userProfile,
            spreadType,
          });
          setPersonalizedReading(reading);

          const userBlockPayload = {
            user_id: user?.id ?? null,
            block_type_id: selectedBlock?.id ?? null,
            name: await generateUserBlockName(selectedBlock?.name, userContext),
            status: 'in-progress',
            progress: 0,
            notes: null,
          };

          const userBlock = await createUserBlock(userBlockPayload);

          const insight = await createInsight({
            user_id: user?.id ?? null,
            spread_type: spreadType,
            block_type_id: selectedBlock?.id ?? null,
            user_context: userContext ?? null,
            cards_drawn: drawnCards.map((dc) => dc.id),
            resonated: false,
            took_action: false,
            reading,
            user_block_id: userBlock.id,
          });

          navigate(`/insights/${insight.id}`, {
            state: {
              spreadType,
            },
          });
        } catch (error) {
          console.error('Failed to generate personalized reading:', error);
          if (error instanceof Error && error.message) {
            console.error('Error message:', error.message);
          }
          setReadingError(true);
        } finally {
          setLoadingReading(false);
        }
      }
    };

    generateReading();
  }, [
    isDrawing,
    drawnCards,
    selectedBlock,
    userProfile,
    userContext,
    personalizedReading,
    spreadType,
    user?.id,
    navigate,
  ]);

  const handleReset = () => {
    navigate('/');
  };

  // Pick a random duck GIF for the loader on mount
  const loadingGIF = React.useMemo(() => {
    return duckGifs[Math.floor(Math.random() * duckGifs.length)];
  }, []);

  // Always show the loading GIF at the top
  const renderLoader = () => (
    <div className="flex flex-col items-center mb-6">
      {loadingGIF && (
        <img src={loadingGIF} alt="Wizard Duck Coding" className="mb-4" />
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
    loadingText = 'Generating your insight...';
  }

  // Show loader GIF and spinner at the top for loading states
  if (cardsLoading || isDrawing || loadingReading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-void-gradient min-h-screen flex items-center justify-center">
        <div className="text-center w-full">
          {renderLoader()}
          {loadingText && (
            <p className="text-lg text-primary font-semibold">{loadingText}</p>
          )}
        </div>
      </div>
    );
  }

  // RETURN WITHOUT LOADING FOR ALL OTHER STATES

  if (readingError) {
    return (
      <ErrorState
        error="Failed to generate reading"
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

export default Reading;
