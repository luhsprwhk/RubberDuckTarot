import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserBlockById } from '../lib/blocks/block-queries';
import type { UserBlock, BlockType, Insight } from '@/supabase/schema';
import { getBlockTypeById } from '../lib/blocktypes/blocktype-queries';
import { getInsightsByUserBlockId } from '../lib/insights/insight-queries';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { Plus, Lightbulb, Calendar } from 'lucide-react';

const BlockDetails: React.FC = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate = useNavigate();
  const [block, setBlock] = useState<UserBlock | null>(null);
  const [blockType, setBlockType] = useState<BlockType | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockData = async () => {
      if (!blockId) {
        setError('No block ID provided.');
        setLoading(false);
        return;
      }
      try {
        const userBlock = await getUserBlockById(Number(blockId));
        if (!userBlock) {
          setError('Block not found.');
          setLoading(false);
          return;
        }
        setBlock(userBlock);

        const [type, blockInsights] = await Promise.all([
          getBlockTypeById(userBlock.block_type_id),
          getInsightsByUserBlockId(userBlock.id),
        ]);

        setBlockType(type);
        setInsights(blockInsights);
      } catch (err) {
        setError('Failed to fetch block details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlockData();
  }, [blockId]);

  const handleNewInsight = () => {
    if (!block || !blockType) return;

    navigate('/new-insight', {
      state: {
        userBlockId: block.id,
        blockName: block.name,
      },
    });
  };

  if (loading) return <Loading text="Loading block details..." />;
  if (error) return <ErrorState error={error} />;
  if (!block)
    return (
      <div className="p-6 text-center text-gray-400">Block not found.</div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        to="/blocks"
        className="text-breakthrough-400 hover:underline mb-6 inline-block"
      >
        &larr; Back to Blocks
      </Link>

      {/* Block Header */}
      <div className="bg-surface p-6 rounded-xl border border-liminal-border backdrop-blur-liminal mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
            {blockType
              ? `${blockType.emoji} ${blockType.name}`
              : block.block_type_id}
          </h1>
          <button
            onClick={handleNewInsight}
            className="cursor-pointer bg-breakthrough-400 text-void-900 px-4 py-2 rounded-lg font-medium hover:bg-breakthrough-300 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 " />
            New Insight
          </button>
        </div>

        <div className="mb-4 text-lg font-semibold text-primary">
          {block.name}
        </div>

        <div className="mb-4">
          <span className="font-semibold text-secondary">Status:</span>{' '}
          <span className="text-primary">{block.status}</span>
          <div className="flex gap-2 mt-2">
            <button
              className={`cursor-pointer px-3 py-1 rounded bg-breakthrough-400 text-void-900 text-xs font-semibold hover:bg-breakthrough-300 transition-colors ${block.status === 'resolved' ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={block.status === 'resolved'}
              onClick={async () => {
                if (!block) return;
                try {
                  await import('../lib/blocks/block-queries').then(
                    ({ updateUserBlockStatus }) =>
                      updateUserBlockStatus(block.id, 'resolved')
                  );
                  setBlock({ ...block, status: 'resolved' });
                } catch (err) {
                  alert('Failed to update status');
                  console.error(err);
                }
              }}
            >
              Mark as Resolved
            </button>
            <button
              className={`cursor-pointer px-3 py-1 rounded text-white text-xs font-semibold transition-colors ${block.status === 'paused' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
              onClick={async () => {
                if (!block) return;
                const newStatus =
                  block.status === 'paused' ? 'active' : 'paused';
                try {
                  await import('../lib/blocks/block-queries').then(
                    ({ updateUserBlockStatus }) =>
                      updateUserBlockStatus(block.id, newStatus)
                  );
                  setBlock({ ...block, status: newStatus });
                } catch (err) {
                  console.error(err);
                  alert('Failed to update status.');
                }
              }}
            >
              {block.status === 'paused' ? 'Mark as Active' : 'Pause'}
            </button>
          </div>
        </div>

        {block.notes && (
          <div className="mb-4">
            <span className="font-semibold text-secondary">Notes:</span>{' '}
            <span className="text-primary">{block.notes}</span>
          </div>
        )}

        <div className="text-xs text-secondary border-t border-liminal-border pt-4">
          Created: {new Date(block.created_at).toLocaleString()}
          <br />
          Updated: {new Date(block.updated_at).toLocaleString()}
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-surface p-6 rounded-xl border border-liminal-border backdrop-blur-liminal">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-breakthrough-400" />
          <h2 className="text-xl font-bold text-primary">
            Insights for this Block ({insights.length})
          </h2>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-secondary mb-4">
              No insights yet for this block. Create your first consultation!
            </div>
            <button
              onClick={handleNewInsight}
              className="bg-breakthrough-400 text-void-900 px-6 py-3 rounded-lg font-medium hover:bg-breakthrough-300 transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Get First Insight
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <Link
                key={insight.id}
                to={`/insights/${insight.id}`}
                className="block p-4 bg-void-800/50 rounded-lg border border-liminal-border hover:border-breakthrough-400/50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-primary">
                    {insight.spread_type === 'quick-draw'
                      ? 'Quick Duck'
                      : 'Full Pond'}{' '}
                    Reading
                  </div>
                  <div className="flex items-center gap-1 text-xs text-secondary">
                    <Calendar className="w-3 h-3" />
                    {new Date(insight.created_at).toLocaleDateString()}
                  </div>
                </div>

                {insight.user_context && (
                  <div className="text-sm text-secondary mb-2">
                    Context: {insight.user_context}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-breakthrough-400">
                    Cards: {insight.cards_drawn.length}
                  </span>
                  {insight.resonated && (
                    <span className="text-accent">✨ Resonated</span>
                  )}
                  {insight.took_action && (
                    <span className="text-accent">🎯 Took Action</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockDetails;
