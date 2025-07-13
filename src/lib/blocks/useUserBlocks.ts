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

    let timeoutId: NodeJS.Timeout | undefined;

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('User blocks fetch timeout'));
        }, 8000); // 8 second timeout
      });

      // Race between actual fetch and timeout
      const userBlocks = await Promise.race([
        getUserBlocks(userId),
        timeoutPromise,
      ]);

      if (timeoutId) clearTimeout(timeoutId);
      setBlocks(userBlocks || []); // Always set to an array
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch blocks';
      setError(errorMessage);
      setBlocks([]); // Ensure blocks is always an array on error
      console.error('useUserBlocks error:', errorMessage);
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
