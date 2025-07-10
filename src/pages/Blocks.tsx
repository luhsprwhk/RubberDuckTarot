import React from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';
import type { BlockType } from '../interfaces';
import { Target, Plus } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useUserBlocks } from '../lib/blocks/useUserBlocks';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import robEmoji from '../assets/rob-emoji.png';
import { BlocksAd, NativeContentAd } from '../components/ads/SmartAd';

const Blocks: React.FC = () => {
  const { user } = useAuth();
  const {
    blocks,
    loading: blocksLoading,
    error: blocksError,
    fetchUserBlocks,
  } = useUserBlocks();
  const {
    blockTypes,
    loading: blockTypesLoading,
    error: blockTypesError,
    refreshBlockTypes,
  } = useBlockTypes();

  const error = blocksError || blockTypesError;

  const [initialLoading, setInitialLoading] = React.useState(true);

  React.useEffect(() => {
    if (!blocksLoading && !blockTypesLoading) {
      setInitialLoading(false);
    }
  }, [blocksLoading, blockTypesLoading]);

  React.useEffect(() => {
    if (user?.id) {
      fetchUserBlocks(user.id);
      refreshBlockTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const getBlockTypeName = (blockTypeId: string): string => {
    const blockType = blockTypes.find((bt: BlockType) => bt.id === blockTypeId);
    return blockType ? `${blockType.emoji} ${blockType.name}` : blockTypeId;
  };

  const formatDate = (timestamp: Date | number | string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'text-breakthrough-400 bg-breakthrough-400/20';
      case 'resolved':
        return 'text-green-400 bg-green-400/20';
      case 'paused':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-accent bg-accent/20';
    }
  };

  if (initialLoading) {
    return <Loading text="Loading your blocks..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (blocks.length === 0) {
    return <EmptyBlocksState />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg min-h-screen mt-6">
      <div className="text-center mb-8">
        <div className="mb-4">
          <Target className="w-16 h-16 mx-auto text-breakthrough-400" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Your Block Tracker
        </h1>
        <p className="text-accent">
          {blocks.length} block{blocks.length !== 1 ? 's' : ''} being tracked
        </p>
      </div>

      {/* Blocks list ad */}
      <BlocksAd className="mb-6" />

      <div className="space-y-6 bg-liminal-surface shadow-breakthrough rounded-lg mt-6 mb-6 p-6 border-liminal-border border">
        {blocks.map((block, index) => (
          <React.Fragment key={block.id}>
            <Link
              to={`/blocks/${block.id}`}
              className="block bg-liminal-overlay border-l-4 border-liminal-border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-breakthrough-400"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded',
                        getStatusColor(block.status)
                      )}
                    >
                      {block.status.charAt(0).toUpperCase() +
                        block.status.slice(1)}
                    </span>
                    <span className="text-sm text-secondary">
                      {formatDate(block.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-1">
                    {block.name}
                  </h3>
                  <p className="text-sm text-accent mb-3">
                    {getBlockTypeName(block.block_type_id)}
                  </p>

                  {block.notes && (
                    <div className="mt-3 p-3 bg-void-700 rounded-lg">
                      <p className="text-sm text-secondary">{block.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Show native ad after every 3rd block */}
            {(index + 1) % 3 === 0 && index < blocks.length - 1 && (
              <NativeContentAd className="my-4" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="text-center mt-8 space-y-4">
        <Link
          to="/new-reading"
          className="inline-flex items-center px-6 py-3 bg-breakthrough-400 text-void-900 font-semibold rounded-lg hover:bg-breakthrough-300 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Block
        </Link>
        <p className="text-sm text-accent">
          Start a new reading to identify and track more blocks
        </p>
      </div>
    </div>
  );
};

const EmptyBlocksState = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="max-w-3xl w-full mx-auto bg-surface p-8 rounded-xl border border-liminal-border shadow-lg">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 rounded-full flex items-center justify-center shadow-glow mb-2">
              <img src={robEmoji} alt="Rob" className="w-16 h-16" />
            </div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              No Blocks Being Tracked Yet
            </h2>
            <p className="text-secondary mb-2">
              <strong>Rob here.</strong> No blocks in your tracker means you're
              either living life with zero obstacles (impressive!) or you
              haven't started identifying what's actually getting in your way.
            </p>
            <p className="text-secondary mb-6 font-medium">
              Let's find out what's blocking you and turn it into a trackable
              goal.
            </p>
            <Link
              to="/new-reading"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Identify Your First Block
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blocks;
