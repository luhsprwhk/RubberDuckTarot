import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NewReading from './NewReading';
import OnBoarding from '../pages/OnBoarding';
import { getDb } from '@/lib/database-provider';
import {
  getUserProfile,
  isProfileComplete,
  type UserProfile,
} from '../shared/userPreferences';
import type { BlockType } from '../shared/interfaces';
import useCards from '../hooks/useCards';

export default function Lobby() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cards } = useCards();
  console.log({ cards });
  // State management
  const [loading, setLoading] = useState(true);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [db, profile] = await Promise.all([
            getDb(),
            getUserProfile(user.id),
          ]);
          const loadedBlockTypes = await db.getAllBlockTypes();
          if (isMounted) {
            setBlockTypes(loadedBlockTypes);
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handlers
  const handleNewReading = () => {
    if (!selectedBlockType || !selectedSpread) return;

    navigate('/reading', {
      state: {
        selectedBlockTypeId: selectedBlockType,
        spreadType: selectedSpread,
        userContext: userContext,
      },
    });

    handleReset(); // Reset state after navigating
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

  if (!isProfileComplete(userProfile)) {
    return <OnBoarding />;
  }

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
}
