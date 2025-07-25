import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';
import type { BlockType, UserBlock } from '../interfaces';
import { Archive, ArrowLeft } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { getArchivedUserBlocks } from '../lib/blocks/block-queries';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import { NativeContentAd } from '../components/ads/SmartAd';

const ArchivedBlocks: React.FC = () => {
  const { user } = useAuth();
  const [archivedBlocks, setArchivedBlocks] = useState<UserBlock[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [blocksError, setBlocksError] = useState<string | null>(null);

  const {
    blockTypes,
    loading: blockTypesLoading,
    error: blockTypesError,
    refreshBlockTypes,
  } = useBlockTypes();

  const error = blocksError || blockTypesError;

  const [initialLoading, setInitialLoading] = useState(true);

  React.useEffect(() => {
    if (!blocksLoading && !blockTypesLoading) {
      setInitialLoading(false);
    }
  }, [blocksLoading, blockTypesLoading]);

  useEffect(() => {
    const fetchArchivedBlocks = async () => {
      if (!user?.id) return;

      setBlocksLoading(true);
      setBlocksError(null);

      try {
        const blocks = await getArchivedUserBlocks(user.id);
        setArchivedBlocks(blocks);
      } catch (err) {
        console.error('Failed to fetch archived blocks:', err);
        setBlocksError('Failed to load archived blocks');
      } finally {
        setBlocksLoading(false);
      }
    };

    if (user?.id) {
      fetchArchivedBlocks();
      refreshBlockTypes();
    }
  }, [user?.id, refreshBlockTypes]);

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
      case 'archived':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-accent bg-accent/20';
    }
  };

  if (initialLoading) {
    return <Loading text="Loading archived blocks..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (archivedBlocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 rounded-lg min-h-screen mt-6">
        <div className="mb-6">
          <Link
            to="/blocks"
            className="inline-flex items-center text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blocks
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="mb-4">
            <Archive className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Archived Blocks
          </h1>
          <p className="text-accent">
            No archived blocks found. Blocks you archive will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg min-h-screen mt-6">
      <div className="mb-6">
        <Link
          to="/blocks"
          className="inline-flex items-center text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blocks
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="mb-4">
          <Archive className="w-16 h-16 mx-auto text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Archived Blocks
        </h1>
        <p className="text-accent">
          {archivedBlocks.length} archived block
          {archivedBlocks.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-6 bg-liminal-surface shadow-breakthrough rounded-lg mt-6 mb-6 p-6 border-liminal-border border">
        {archivedBlocks.map((block, index) => (
          <React.Fragment key={block.id}>
            <Link
              to={`/blocks/${block.id}`}
              className="block bg-liminal-overlay border border-default rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-gray-400"
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

                  {block.resolution_reflection && (
                    <div className="mt-3 p-3 bg-green-900/20 rounded-lg border border-green-400/20">
                      <p className="text-xs text-green-400 font-medium mb-1">
                        Resolution Reflection
                      </p>
                      <p className="text-sm text-secondary">
                        {block.resolution_reflection}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {/* Show native ad after every 3rd block */}
            {(index + 1) % 3 === 0 && index < archivedBlocks.length - 1 && (
              <NativeContentAd className="my-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ArchivedBlocks;
