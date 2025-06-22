import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuickDuckSpread from '../components/QuickDuckSpread';
import FullPondSpread from '../components/FullPondSpread';
import { getUserProfile, type UserProfile } from '../shared/userPreferences';
import useAuth from '../hooks/useAuth';
import useCards from '../hooks/useCards';
import type { Card } from '../shared/interfaces';

interface ReadingState {
  selectedBlockTypeId: string;
  spreadType: 'quick-draw' | 'full-pond';
  userContext?: string;
}

const Reading: React.FC = () => {
  const { user } = useAuth();
  const { cards, loading: cardsLoading, error: cardsError } = useCards();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReadingState | null;
  const { spreadType, selectedBlockTypeId, userContext = '' } = state || {};

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDataAndDrawCards = async () => {
      if (!user || !spreadType || !selectedBlockTypeId || cardsLoading) {
        return;
      }

      // Wait for cards to be loaded from context
      if (cards.length === 0) {
        if (!cardsLoading && !cardsError) {
          console.error('No cards available');
        }
        return;
      }

      setIsDrawing(true);
      setDrawnCards([]);

      try {
        // Only need to fetch user profile now
        const profile = await getUserProfile(user.id);

        if (!isMounted) return;

        setUserProfile(profile);

        // Draw cards from context
        const numCardsToDraw = spreadType === 'quick-draw' ? 1 : 3;
        const drawnCardsList: Card[] = [];

        // Ensure no duplicate cards in the same reading
        const availableCards = [...cards];
        for (let i = 0; i < numCardsToDraw; i++) {
          if (availableCards.length === 0) break;
          const randomIndex = Math.floor(Math.random() * availableCards.length);
          drawnCardsList.push(availableCards.splice(randomIndex, 1)[0]);
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
  }, [user, spreadType, selectedBlockTypeId, cards, cardsLoading, cardsError]);

  const handleReset = () => {
    navigate('/'); // Navigate back to Home to start a new reading
  };

  if (!state) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-orange-600 mb-4">
          Oops! Reading details are missing.
        </h2>
        <p className="text-gray-700 mb-6">
          To see your tarot reading, please start by setting up your question on
          the home page.
        </p>
        <button
          onClick={handleReset} // Navigate to home
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Home Page
        </button>
      </div>
    );
  }

  if (cardsLoading || isDrawing) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦆</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {cardsLoading
              ? 'Rob is preparing the deck...'
              : 'Rob is shuffling the deck...'}
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (cardsError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Card Loading Error
        </h2>
        <p className="text-gray-700 mb-6">{cardsError}</p>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // After loading, check if cards were actually drawn
  if (drawnCards.length === 0 && !isDrawing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Failed to Draw Cards
        </h2>
        <p className="text-gray-700 mb-6">
          We couldn't draw any cards. This might be a temporary issue or the
          deck might be empty.
        </p>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (spreadType === 'quick-draw' && drawnCards.length === 1) {
    return (
      <QuickDuckSpread
        step="revealed"
        drawnCard={drawnCards[0]}
        selectedBlockTypeId={selectedBlockTypeId!}
        userContext={userContext}
        userProfile={userProfile}
        onReset={handleReset}
      />
    );
  }

  if (spreadType === 'full-pond' && drawnCards.length === 3) {
    return (
      <FullPondSpread
        drawnCards={drawnCards}
        selectedBlockTypeId={selectedBlockTypeId!}
        onReset={handleReset}
        userContext={userContext}
        userProfile={userProfile}
      />
    );
  }

  // Fallback for unknown spreadType
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-red-500 mb-4">Invalid spread type specified.</p>
      <button onClick={handleReset} className="text-blue-500 hover:underline">
        Please try again
      </button>
    </div>
  );
};

export default Reading;
