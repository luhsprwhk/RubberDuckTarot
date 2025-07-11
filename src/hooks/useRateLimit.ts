import { useState, useCallback } from 'react';
import {
  rateLimiter,
  RateLimitError,
  RateLimitResult,
} from '../lib/rate-limiter';

interface UseRateLimitOptions {
  userId: string;
  operation: string;
  onError?: (error: RateLimitError) => void;
}

interface UseRateLimitReturn {
  checkLimit: (estimatedTokens?: number) => Promise<boolean>;
  recordTokenUsage: (actualTokens: number) => Promise<void>;
  getStatus: () => Promise<RateLimitResult>;
  resetLimit: () => Promise<boolean>;
  isLoading: boolean;
  error: RateLimitError | null;
  clearError: () => void;
}

export const useRateLimit = ({
  userId,
  operation,
  onError,
}: UseRateLimitOptions): UseRateLimitReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<RateLimitError | null>(null);

  const checkLimit = useCallback(
    async (estimatedTokens: number = 0): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await rateLimiter.checkLimit(
          userId,
          operation,
          estimatedTokens
        );

        if (!result.allowed) {
          const rateLimitError = new RateLimitError(
            `Rate limit exceeded for ${operation}`,
            result.retryAfter || 0,
            result.resetTime,
            result.remainingRequests
          );

          setError(rateLimitError);
          onError?.(rateLimitError);
          return false;
        }

        return true;
      } catch (err) {
        if (err instanceof RateLimitError) {
          setError(err);
          onError?.(err);
          return false;
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, operation, onError]
  );

  const recordTokenUsage = useCallback(
    async (actualTokens: number): Promise<void> => {
      try {
        await rateLimiter.recordTokenUsage(userId, operation, actualTokens);
      } catch (err) {
        console.error('Failed to record token usage:', err);
      }
    },
    [userId, operation]
  );

  const getStatus = useCallback(async (): Promise<RateLimitResult> => {
    return await rateLimiter.getStatus(userId, operation);
  }, [userId, operation]);

  const resetLimit = useCallback(async (): Promise<boolean> => {
    try {
      const result = await rateLimiter.resetLimit(userId, operation);
      setError(null);
      return result;
    } catch (err) {
      console.error('Failed to reset rate limit:', err);
      return false;
    }
  }, [userId, operation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checkLimit,
    recordTokenUsage,
    getStatus,
    resetLimit,
    isLoading,
    error,
    clearError,
  };
};

export default useRateLimit;
