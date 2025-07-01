import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';
import type { BlockType } from '../interfaces';
import { Target, Plus } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useUserBlocks } from '../lib/blocks/useUserBlocks';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import robEmoji from '../assets/rob-emoji.png';

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
  }, [user?.id, fetchUserBlocks, refreshBlockTypes]);

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

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return 'bg-green-400';
    if (progress >= 50) return 'bg-breakthrough-400';
    if (progress >= 25) return 'bg-yellow-400';
    return 'bg-red-400';
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
    <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen">
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

      <div className="space-y-6">
        {blocks.map((block) => (
          <Link
            to={`/blocks/${block.id}`}
            key={block.id}
            className="block bg-void-800 border-l-4 border-liminal-border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(block.status)}`}
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

                {/* Progress Bar */}
                <div className="w-full bg-void-600 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(block.progress)}`}
                    style={{ width: `${block.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary">Progress</span>
                  <span className="text-primary font-medium">
                    {block.progress}%
                  </span>
                </div>

                {block.notes && (
                  <div className="mt-3 p-3 bg-void-700 rounded-lg">
                    <p className="text-sm text-secondary">{block.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Link>
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
        <div className="bg-void-800 rounded-xl shadow-lg p-8 border-l-4 border-liminal-border">
          <h2 className="text-2xl font-bold text-primary mb-4">
            No Blocks Being Tracked Yet
          </h2>

          <div className="bg-void-800 rounded-lg p-6 mb-6 border-l-4 border-breakthrough-400">
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center p-2 md:p-4 gap-4 min-w-[72px]">
                <img src={robEmoji} alt="Rob" className="w-20 h-16" />
              </div>
              <div className="text-left">
                <p className="text-primary mb-3">
                  <strong>Rob here.</strong> No blocks in your tracker means
                  you're either living life with zero obstacles (impressive!) or
                  you haven't started identifying what's actually getting in
                  your way.
                </p>

                <p className="text-primary font-medium">
                  Let's find out what's blocking you and turn it into a
                  trackable goal.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/new-reading"
            className="inline-flex items-center px-8 py-3 bg-void-gradient text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Target className="w-5 h-5 mr-2" />
            Identify Your First Block
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blocks;
