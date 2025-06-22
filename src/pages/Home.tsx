import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NewReading from '../components/NewReading';
import FullPondSpread from '../components/FullPondSpread';
import Landing from '../components/Landing';
import OnBoarding from './OnBoarding';
import { getDb } from '@/lib/database-provider';
import {
  getUserProfile,
  isProfileComplete,
  type UserProfile,
} from '../lib/userPreferences';
import type { Card, BlockType } from '@/src/shared/interfaces';

export default function Home() {
  const { user } = useAuth();
  const isUserLoggedIn = !!user;
  const navigate = useNavigate();

  // State management
  const [step, setStep] = useState<'setup' | 'drawing' | 'full-pond-display'>(
    'setup'
  );
  const [loading, setLoading] = useState(true);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch user readings, block types, and profile
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (user) {
        try {
          const [db, profile] = await Promise.all([
            getDb(),
            getUserProfile(user.id),
          ]);
          const loadedBlockTypes = await db.getAllBlockTypes();
          if (isMounted) {
            setBlockTypes(loadedBlockTypes);
            setUserProfile(profile);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          if (isMounted) setLoading(false);
        }
      } else if (!isUserLoggedIn) {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, isUserLoggedIn]);

  // Handlers
  const handleDrawCard = async () => {
    if (!selectedBlockType || !selectedSpread) return;

    setStep('drawing');
    const db = await getDb();
    const allCards = await db.getAllCards();

    // Simulate drawing time
    setTimeout(() => {
      if (selectedSpread === 'quick-draw') {
        const randomCard =
          allCards[Math.floor(Math.random() * allCards.length)];
        navigate('/reading', {
          state: {
            drawnCards: [randomCard],
            selectedBlockTypeId: selectedBlockType,
            spreadType: 'quick-draw',
          },
        });
        handleReset(); // Reset state after navigating
      } else if (selectedSpread === 'full-pond') {
        const randomCards: Card[] = [];
        for (let i = 0; i < 3; i++) {
          randomCards.push(
            allCards[Math.floor(Math.random() * allCards.length)]
          );
        }
        setDrawnCards(randomCards);
        setStep('full-pond-display');
      }
    }, 1000);
  };

  const handleReset = () => {
    setStep('setup');
    setDrawnCards([]);
    setSelectedSpread(null);
    setSelectedBlockType('');
    setUserContext('');
  };

  // Conditional rendering logic
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isUserLoggedIn) {
    return <Landing />;
  }

  if (!isProfileComplete(userProfile)) {
    return <OnBoarding />;
  }

  const renderContent = () => {
    switch (step) {
      case 'setup':
        return (
          <NewReading
            blockTypes={blockTypes}
            selectedBlockType={selectedBlockType}
            userContext={userContext}
            onBlockSelect={setSelectedBlockType}
            onUserContextChange={setUserContext}
            onSpreadSelect={setSelectedSpread}
            onDrawCard={handleDrawCard}
            selectedSpread={selectedSpread}
          />
        );
      case 'drawing':
        return (
          <div className="text-center py-10">
            <p className="text-2xl text-gray-700 animate-pulse">
              Shuffling the deck and drawing your cards...
            </p>
          </div>
        );
      case 'full-pond-display':
        return (
          <FullPondSpread
            drawnCards={drawnCards}
            selectedBlockTypeId={selectedBlockType}
            onReset={handleReset}
          />
        );
      default:
        return <div>An unexpected error occurred.</div>;
    }
  };

  return <div className="container mx-auto p-4">{renderContent()}</div>;
}
