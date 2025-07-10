import React from 'react';
import { Target, Trash2 } from 'lucide-react';
import type { UserBlock } from '@/supabase/schema';
import type { BlockType } from '../interfaces';
import { cn } from '../lib/utils';

interface BlockTrackerProps {
  blocks: UserBlock[];
  blockTypes: BlockType[];
  onUpdateStatus?: (blockId: number, status: string) => void;
  onDeleteBlock?: (blockId: number) => void;
  onClickBlock?: (blockId: number) => void;
  compact?: boolean;
}

const BlockTracker: React.FC<BlockTrackerProps> = ({
  blocks,
  blockTypes,
  onUpdateStatus,
  onClickBlock,
  onDeleteBlock,
  compact = false,
}) => {
  const getBlockTypeName = (blockTypeId: string): string => {
    const blockType = blockTypes.find((bt: BlockType) => bt.id === blockTypeId);
    return blockType ? `${blockType.emoji} ${blockType.name}` : blockTypeId;
  };

  const formatDate = (timestamp: Date | number | string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
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

  if (blocks.length === 0) {
    return (
      <div className="text-center py-8 text-accent">
        <Target className="w-12 h-12 mx-auto mb-3 text-accent/50" />
        <p>No blocks being tracked yet</p>
        <p className="text-sm">Start a reading to identify blocks</p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {blocks.map((block) => (
        <div
          key={block.id}
          onClick={() => onClickBlock?.(block.id)}
          className={`bg-liminal-overlay rounded-lg shadow-sm border border-default p-${compact ? '4' : '5'} cursor-pointer hover:shadow-md hover:border-breakthrough-400 transition-shadow`}
        >
          <div className="flex justify-between items-start mb-3 pl-2 py-2">
            <div className="flex-1 ">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-1 rounded',
                    getStatusColor(block.status)
                  )}
                >
                  {block.status.charAt(0).toUpperCase() + block.status.slice(1)}
                </span>
                <span className="text-xs text-secondary">
                  {formatDate(block.created_at)}
                </span>
              </div>
              <h4
                className={`font-semibold text-secondary mb-1 ${compact ? 'text-sm' : 'text-base'}`}
              >
                {block.name}
              </h4>
              {!compact && (
                <p className="text-sm text-accent mb-3">
                  {getBlockTypeName(block.block_type_id)}
                </p>
              )}
            </div>

            {(onUpdateStatus || onDeleteBlock) && (
              <div className="flex gap-2">
                {onDeleteBlock && (
                  <button
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this block?')
                      ) {
                        onDeleteBlock?.(block.id);
                      }
                    }}
                    className="p-1 text-accent hover:text-red-400 transition-colors"
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {block.notes && !compact && (
            <div className="mt-3 p-3 bg-liminal-overlay rounded-lg">
              <p className="text-sm text-secondary">{block.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlockTracker;
