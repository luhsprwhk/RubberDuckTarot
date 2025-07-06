import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';
import NewInsightForm from './NewInsightForm';
import BlockTracker from './BlockTracker';
import { useUserBlocks } from '../lib/blocks/useUserBlocks';
import { Link } from 'react-router-dom';
import { getDb } from '@/src/lib/database-provider';
import { getUserProfile, isProfileComplete } from '../lib/userPreferences';
import type { BlockType } from '@/src/interfaces';
import Loading from './Loading';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // State management
  const [loading, setLoading] = useState(true);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');

  // UserBlocks
  const { blocks, loading: blocksLoading, fetchUserBlocks } = useUserBlocks();

  // Logging for debugging

  useEffect(() => {
    if (user) {
      fetchUserBlocks(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

    navigate('/create-insight', {
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

  // Defensive loading: if user is not present, show loading spinner
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading text="Loading user..." />
      </div>
    );
  }

  const handleBlockClick = (blockId: number) => {
    navigate(`/blocks/${blockId}`);
  };

  // Log the blocks state for debugging

  // Improved conditional: also check if blocks is undefined
  if (loading || blocksLoading || typeof blocks === 'undefined') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading text="Loading..." />
      </div>
    );
  }

  // If user has active blocks, show them and a 'New Block' button
  if (blocks && blocks.length > 0) {
    // Filter only active blocks (status === 'active' or 'in-progress')
    const activeBlocks = blocks.filter(
      (block) => block.status === 'active' || block.status === 'in-progress'
    );
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          Your Active Blocks
        </h2>
        <BlockTracker
          blocks={activeBlocks}
          blockTypes={blockTypes}
          onClickBlock={handleBlockClick}
        />
        <div className="mt-8 flex justify-center">
          <Link
            to="/new-insight"
            className="inline-flex items-center px-6 py-3 bg-breakthrough-400 text-void-900 font-semibold rounded-lg hover:bg-breakthrough-300 transition-colors shadow-lg"
          >
            + New Insight
          </Link>
        </div>
      </div>
    );
  }

  // Otherwise, show the new reading component
  return (
    <div className="max-w-3xl mx-auto p-6 bg-surface rounded-lg border border-liminal-border backdrop-blur-liminal shadow-glow mt-16">
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
    </div>
  );
}
