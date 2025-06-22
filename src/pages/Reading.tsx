import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuickDrawSpread from '../components/QuickDrawSpread';
import FullPondSpread from '../components/FullPondSpread';
import { getUserProfile, type UserProfile } from '../shared/userPreferences';
import useAuth from '../hooks/useAuth';
import type { Card } from '../shared/interfaces';

interface ReadingState {
  drawnCards: Card[];
  selectedBlockTypeId: string;
  spreadType: 'quick-draw' | 'full-pond';
  userContext?: string;
}

const Reading: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReadingState | null;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleReset = () => {
    navigate('/'); // Navigate back to Home to start a new reading
  };

  if (
    !state ||
    !state.drawnCards ||
    !state.selectedBlockTypeId ||
    !state.spreadType
  ) {
    // Attempt to gracefully handle missing state, perhaps from a direct navigation or refresh
    // A more robust solution might involve session storage or redirecting with an error message
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

  const {
    drawnCards,
    selectedBlockTypeId,
    spreadType,
    userContext = '',
  } = state;

  if (spreadType === 'quick-draw') {
    if (!drawnCards || drawnCards.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500 mb-4">
            No card was drawn for the Quick Draw spread.
          </p>
          <button
            onClick={handleReset}
            className="text-blue-500 hover:underline"
          >
            Please try again
          </button>
        </div>
      );
    }
    return (
      <QuickDrawSpread
        step="revealed"
        drawnCard={drawnCards[0]}
        selectedBlockTypeId={selectedBlockTypeId}
        userContext={userContext}
        userProfile={userProfile}
        onReset={handleReset}
      />
    );
  }

  if (spreadType === 'full-pond') {
    if (!drawnCards || drawnCards.length < 3) {
      // Full Pond expects 3 cards
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500 mb-4">
            Not enough cards were drawn for the Full Pond spread.
          </p>
          <button
            onClick={handleReset}
            className="text-blue-500 hover:underline"
          >
            Please try again
          </button>
        </div>
      );
    }
    return (
      <FullPondSpread
        drawnCards={drawnCards}
        selectedBlockTypeId={selectedBlockTypeId}
        onReset={handleReset}
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
