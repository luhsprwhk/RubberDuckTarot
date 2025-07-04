import { useState, useCallback } from 'react';
import type { UserBlock } from '@/supabase/schema';
import { getUserBlocks } from './block-queries';

export const useUserBlocks = () => {
  const [blocks, setBlocks] = useState<UserBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBlocks = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const userBlocks = await getUserBlocks(userId);

      setBlocks(userBlocks || []); // Always set to an array
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blocks');
      setBlocks([]); // Ensure blocks is always an array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBlocks = useCallback(
    async (userId?: string) => {
      await fetchUserBlocks(userId);
    },
    [fetchUserBlocks]
  );

  return {
    blocks,
    loading,
    error,
    fetchUserBlocks,
    refreshBlocks,
  };
};
