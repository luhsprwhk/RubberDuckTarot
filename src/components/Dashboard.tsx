import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';
import NewInsightForm from './NewInsightForm';
import BlockTracker from './BlockTracker';
import { useUserBlocks } from '../lib/blocks/useUserBlocks';
import { Link } from 'react-router-dom';
import { getDb } from '@/src/lib/database-provider';
import { getUserProfile, isProfileComplete } from '../lib/userPreferences';
import type { BlockType, UserProfile } from '@/src/interfaces';
import Loading from './Loading';
import { DashboardAd, NativeContentAd } from './ads/SmartAd';
import { cn } from '../lib/utils';

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
    console.log('Dashboard: Loading states -', {
      authLoading: loading,
      blocksLoading,
      user: !!user,
      blocksCount: blocks?.length || 0,
    });
  }, [loading, blocksLoading, user, blocks]);

  useEffect(() => {
    if (user) {
      console.log('Dashboard: Fetching user blocks for user:', user.id);
      fetchUserBlocks(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchUserData = async () => {
      if (user) {
        setLoading(true);

        const MAX_RETRIES = 3;
        const INITIAL_DELAY_MS = 1000;

        let attempt = 0;
        while (attempt <= MAX_RETRIES) {
          try {
            // Set a timeout to prevent indefinite loading
            const timeoutPromise = new Promise<never>((_, reject) => {
              timeoutId = setTimeout(() => {
                reject(new Error('Dashboard data fetch timeout'));
              }, 10000); // 10 second timeout
            });

            const dataPromise = Promise.all([
              getDb(),
              getUserProfile(user.id),
            ]).then(async ([db, profile]) => {
              const loadedBlockTypes = await db.getAllBlockTypes();
              return { profile, loadedBlockTypes };
            });

            const { profile, loadedBlockTypes } = (await Promise.race([
              dataPromise,
              timeoutPromise,
            ])) as {
              profile: UserProfile | null;
              loadedBlockTypes: BlockType[];
            };

            clearTimeout(timeoutId);

            if (isMounted) {
              setBlockTypes(loadedBlockTypes);

              // Navigate to onboarding if profile is incomplete
              if (!isProfileComplete(profile)) {
                navigate('/onboarding');
              }
            }

            // Successful fetch; exit loop
            break;
          } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);

            // If we've exhausted retries, log and exit
            if (attempt === MAX_RETRIES) {
              console.error('Error fetching user data after retries:', error);
              break;
            }

            // Exponential backoff delay
            const delay = INITIAL_DELAY_MS * 2 ** attempt;
            console.warn(
              `Dashboard fetch failed (attempt ${attempt + 1}). Retrying in ${delay} ms...`,
              error
            );
            await new Promise((res) => setTimeout(res, delay));
            attempt += 1;
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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

  // Show loading while fetching user data or blocks
  if (loading || blocksLoading) {
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
      <div>
        <div className="mt-8 flex justify-end max-w-3xl mx-auto">
          <Link
            to="/new-insight"
            className="inline-flex items-center px-6 py-3 text-xs bg-breakthrough-400 text-void-900 font-semibold rounded-lg hover:bg-breakthrough-300 transition-colors shadow-lg"
          >
            + New Insight
          </Link>
        </div>
        <div
          className={cn(
            'max-w-3xl mx-auto p-6',
            'bg-liminal-surface border-liminal-border border',
            'rounded-lg shadow-breakthrough mt-6 mb-6'
          )}
        >
          {/* Dashboard Header Ad */}
          <DashboardAd className="mb-6" />

          <h2 className="text-2xl font-bold mb-4 text-primary">
            Your Active Blocks
          </h2>
          <BlockTracker
            blocks={activeBlocks}
            blockTypes={blockTypes}
            onClickBlock={handleBlockClick}
          />

          {/* Native content ad between blocks and action */}
          {activeBlocks.length >= 3 && <NativeContentAd className="my-6" />}
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
