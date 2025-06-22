import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NewReading from '../components/NewReading';
import Landing from '../components/Landing';
import OnBoarding from './OnBoarding';
import { getDb } from '@/lib/database-provider';
import {
  getUserProfile,
  isProfileComplete,
  type UserProfile,
} from '../shared/userPreferences';
import type { Card, BlockType } from '@/src/shared/interfaces';

export default function Home() {
  const { user } = useAuth();
  const isUserLoggedIn = !!user;
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
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
  const handleNewReading = async () => {
    if (!selectedBlockType || !selectedSpread) return;

    const db = await getDb();
    const allCards = await db.getAllCards();

    // Simulate drawing time
    setTimeout(() => {
      const numCardsToDraw = selectedSpread === 'quick-draw' ? 1 : 3;
      const drawnCards: Card[] = [];

      for (let i = 0; i < numCardsToDraw; i++) {
        drawnCards.push(allCards[Math.floor(Math.random() * allCards.length)]);
      }

      navigate('/reading', {
        state: {
          drawnCards,
          selectedBlockTypeId: selectedBlockType,
          spreadType: selectedSpread,
          userContext: userContext,
        },
      });

      handleReset(); // Reset state after navigating
    }, 1000);
  };

  const handleReset = () => {
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
    return (
      <NewReading
        blockTypes={blockTypes}
        selectedBlockType={selectedBlockType}
        userContext={userContext}
        onBlockSelect={setSelectedBlockType}
        onUserContextChange={setUserContext}
        onSpreadSelect={setSelectedSpread}
        onNewReading={handleNewReading}
        selectedSpread={selectedSpread}
      />
    );
  };

  return <div className="container mx-auto p-4">{renderContent()}</div>;
}
