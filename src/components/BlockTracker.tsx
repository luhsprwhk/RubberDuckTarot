import React from 'react';
import { Target, Edit, Trash2 } from 'lucide-react';
import type { UserBlock } from '@/supabase/schema';
import type { BlockType } from '../interfaces';

interface BlockTrackerProps {
  blocks: UserBlock[];
  blockTypes: BlockType[];
  onUpdateProgress?: (blockId: number, progress: number) => void;
  onUpdateStatus?: (blockId: number, status: string) => void;
  onDeleteBlock?: (blockId: number) => void;
  compact?: boolean;
}

const BlockTracker: React.FC<BlockTrackerProps> = ({
  blocks,
  blockTypes,
  onUpdateProgress,
  onUpdateStatus,
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

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return 'bg-green-400';
    if (progress >= 50) return 'bg-breakthrough-400';
    if (progress >= 25) return 'bg-yellow-400';
    return 'bg-red-400';
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
          className={`bg-void-800 rounded-lg shadow-sm border border-liminal-border p-${compact ? '4' : '5'} hover:shadow-md transition-shadow`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(block.status)}`}
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

            {(onUpdateProgress || onUpdateStatus || onDeleteBlock) && (
              <div className="flex gap-2">
                {onUpdateProgress && (
                  <button
                    onClick={() => {
                      const newProgress = prompt(
                        'Enter progress (0-100):',
                        block.progress.toString()
                      );
                      if (newProgress !== null) {
                        const progress = Math.max(
                          0,
                          Math.min(100, parseInt(newProgress) || 0)
                        );
                        onUpdateProgress(block.id, progress);
                      }
                    }}
                    className="p-1 text-accent hover:text-breakthrough-400 transition-colors"
                    title="Update progress"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDeleteBlock && (
                  <button
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this block?')
                      ) {
                        onDeleteBlock(block.id);
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

          {/* Progress Bar */}
          <div className="w-full bg-void-600 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(block.progress)}`}
              style={{ width: `${block.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-secondary">Progress</span>
            <span className="text-primary font-medium">{block.progress}%</span>
          </div>

          {block.notes && !compact && (
            <div className="mt-3 p-3 bg-void-700 rounded-lg">
              <p className="text-sm text-secondary">{block.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlockTracker;
