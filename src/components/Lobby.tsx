import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';
import NewInsightForm from './NewInsightForm';
import { getDb } from '@/src/lib/database-provider';
import { getUserProfile, isProfileComplete } from '../lib/userPreferences';
import type { BlockType } from '@/src/interfaces';
import Loading from './Loading';

export default function Lobby() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // State management
  const [loading, setLoading] = useState(true);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');

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

            // Navigate to onboarding if profile is incomplete
            if (!isProfileComplete(profile)) {
              navigate('/onboarding');
            }
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
  }, [user, navigate]);

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
        <Loading />
      </div>
    );
  }

  return (
    <NewInsightForm
      blockTypes={blockTypes}
      selectedBlockType={selectedBlockType}
      userContext={userContext}
      onBlockSelect={setSelectedBlockType}
      onUserContextChange={setUserContext}
      onSpreadSelect={setSelectedSpread}
      onNewReading={handleNewReading}
      selectedSpread={selectedSpread}
      hasUserBlock={false}
    />
  );
}
