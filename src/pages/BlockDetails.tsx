import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserBlockById } from '../lib/blocks/block-queries';
import type { UserBlock, BlockType } from '@/supabase/schema';
import { getBlockTypeById } from '../lib/blocktypes/blocktype-queries';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';

const BlockDetails: React.FC = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const [block, setBlock] = useState<UserBlock | null>(null);
  const [blockType, setBlockType] = useState<BlockType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlock = async () => {
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
        const type = await getBlockTypeById(userBlock.block_type_id);
        setBlockType(type);
      } catch (err) {
        setError('Failed to fetch block details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlock();
  }, [blockId]);

  if (loading) return <Loading text="Loading block details..." />;
  if (error) return <ErrorState error={error} />;
  if (!block)
    return (
      <div className="p-6 text-center text-gray-400">Block not found.</div>
    );

  return (
    <div className="max-w-xl mx-auto p-6 bg-void-800 rounded-lg shadow-lg mt-8">
      <Link to="/blocks" className="text-breakthrough-400 hover:underline">
        &larr; Back to Blocks
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-2 flex items-center gap-2">
        {blockType
          ? `${blockType.emoji} ${blockType.name}`
          : block.block_type_id}
      </h1>
      <div className="mb-4 text-lg font-semibold">{block.name}</div>
      <div className="mb-2">
        <span className="font-semibold">Status:</span> {block.status}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Progress:</span> {block.progress}%
      </div>
      {block.notes && (
        <div className="mb-2">
          <span className="font-semibold">Notes:</span> {block.notes}
        </div>
      )}
      <div className="text-xs text-gray-400 mt-4">
        Created: {new Date(block.created_at).toLocaleString()}
        <br />
        Updated: {new Date(block.updated_at).toLocaleString()}
      </div>
    </div>
  );
};

export default BlockDetails;
