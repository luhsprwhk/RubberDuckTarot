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
import type { BlockType } from '../shared/interfaces';

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

  // Fetch block types and user profile
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
