/**
 * Rate limiting utilities for AI generation endpoints
 * Implements token bucket algorithm with memory-based storage
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  maxTokens?: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  retryAfter?: number;
  totalRequests: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitData | null>;
  set(key: string, data: RateLimitData, ttl: number): Promise<void>;
  increment(key: string, amount?: number): Promise<number>;
  delete(key: string): Promise<boolean>;
}

interface RateLimitData {
  requests: number;
  tokens: number;
  windowStart: number;
  blockedUntil?: number;
}

// Check if rate limiting is enabled (disabled in dev by default)
const isRateLimitingEnabled = (): boolean => {
  return (
    import.meta.env.VITE_ENABLE_RATE_LIMITING === 'true' || import.meta.env.PROD
  );
};

// Rate limiting configurations for different AI operations
const PRODUCTION_LIMITS: Record<string, RateLimitConfig> = {
  // High-cost operations (full readings)
  generateInsight: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    maxTokens: 14000, // 10 readings * 1400 tokens max
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },

  // Medium-cost operations (advice and commentary)
  generateAdviceForUser: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hour
    maxTokens: 6000, // 30 advice * 200 tokens max
    blockDurationMs: 10 * 60 * 1000, // 10 minutes
  },

  generateRobsTake: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    maxTokens: 8000, // 20 takes * 400 tokens max
    blockDurationMs: 10 * 60 * 1000, // 10 minutes
  },

  // Low-cost operations (block names)
  generateUserBlockName: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    maxTokens: 2500, // 50 names * 50 tokens max
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
} as const;

// More lenient limits for development
const DEVELOPMENT_LIMITS: Record<string, RateLimitConfig> = {
  generateInsight: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    maxTokens: 140000, // 10x production
    blockDurationMs: 60 * 1000, // 1 minute
  },

  generateAdviceForUser: {
    maxRequests: 300,
    windowMs: 60 * 60 * 1000, // 1 hour
    maxTokens: 60000, // 10x production
    blockDurationMs: 60 * 1000, // 1 minute
  },

  generateRobsTake: {
    maxRequests: 200,
    windowMs: 60 * 60 * 1000, // 1 hour
    maxTokens: 80000, // 10x production
    blockDurationMs: 60 * 1000, // 1 minute
  },

  generateUserBlockName: {
    maxRequests: 500,
    windowMs: 60 * 60 * 1000, // 1 hour
    maxTokens: 25000, // 10x production
    blockDurationMs: 60 * 1000, // 1 minute
  },
} as const;

export const AI_RATE_LIMITS = import.meta.env.PROD
  ? PRODUCTION_LIMITS
  : DEVELOPMENT_LIMITS;

/**
 * Memory-based rate limit store
 * Uses Map with TTL cleanup for persistence
 */
export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { data: RateLimitData; expires: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  async get(key: string): Promise<RateLimitData | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  async set(key: string, data: RateLimitData, ttl: number): Promise<void> {
    this.store.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    const existing = await this.get(key);
    if (!existing) {
      await this.set(
        key,
        {
          requests: amount,
          tokens: 0,
          windowStart: Date.now(),
        },
        60 * 60 * 1000
      );
      return amount;
    }

    existing.requests += amount;
    await this.set(key, existing, 60 * 60 * 1000);
    return existing.requests;
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expires) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

/**
 * Rate limiter implementation
 */
export class RateLimiter {
  private store: RateLimitStore;

  constructor(store: RateLimitStore = new MemoryRateLimitStore()) {
    this.store = store;
  }

  /**
   * Check if a request is allowed under rate limiting rules
   */
  async checkLimit(
    identifier: string,
    operation: string,
    estimatedTokens: number = 0
  ): Promise<RateLimitResult> {
    // Allow all requests if rate limiting is disabled
    if (!isRateLimitingEnabled()) {
      return {
        allowed: true,
        remainingRequests: 999999,
        resetTime: Date.now() + 60 * 60 * 1000,
        totalRequests: 0,
      };
    }

    const config = AI_RATE_LIMITS[operation];
    if (!config) {
      throw new Error(
        `No rate limit configuration found for operation: ${operation}`
      );
    }

    const key = `rate_limit:${operation}:${identifier}`;
    const now = Date.now();

    // Get current rate limit data
    let data = await this.store.get(key);

    // Initialize if not exists or window expired
    if (!data || now - data.windowStart > config.windowMs) {
      data = {
        requests: 0,
        tokens: 0,
        windowStart: now,
      };
    }

    // Check if currently blocked
    if (data.blockedUntil && now < data.blockedUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: data.windowStart + config.windowMs,
        retryAfter: Math.ceil((data.blockedUntil - now) / 1000),
        totalRequests: data.requests,
      };
    }

    // Check request limit
    if (data.requests >= config.maxRequests) {
      // Block the user temporarily
      data.blockedUntil = now + (config.blockDurationMs || 5 * 60 * 1000);
      await this.store.set(key, data, config.windowMs);

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: data.windowStart + config.windowMs,
        retryAfter: Math.ceil((data.blockedUntil - now) / 1000),
        totalRequests: data.requests,
      };
    }

    // Check token limit if specified
    if (config.maxTokens && data.tokens + estimatedTokens > config.maxTokens) {
      // Block the user temporarily
      data.blockedUntil = now + (config.blockDurationMs || 5 * 60 * 1000);
      await this.store.set(key, data, config.windowMs);

      return {
        allowed: false,
        remainingRequests: Math.max(0, config.maxRequests - data.requests),
        resetTime: data.windowStart + config.windowMs,
        retryAfter: Math.ceil((data.blockedUntil - now) / 1000),
        totalRequests: data.requests,
      };
    }

    // Allow the request
    data.requests += 1;
    data.tokens += estimatedTokens;
    await this.store.set(key, data, config.windowMs);

    return {
      allowed: true,
      remainingRequests: Math.max(0, config.maxRequests - data.requests),
      resetTime: data.windowStart + config.windowMs,
      totalRequests: data.requests,
    };
  }

  /**
   * Record actual token usage after API call
   */
  async recordTokenUsage(
    identifier: string,
    operation: string,
    actualTokens: number
  ): Promise<void> {
    if (!isRateLimitingEnabled()) return;

    const key = `rate_limit:${operation}:${identifier}`;
    const data = await this.store.get(key);

    if (data) {
      // Update actual token usage
      data.tokens = Math.max(data.tokens, actualTokens);
      await this.store.set(
        key,
        data,
        AI_RATE_LIMITS[operation]?.windowMs || 60 * 60 * 1000
      );
    }
  }

  /**
   * Get current rate limit status
   */
  async getStatus(
    identifier: string,
    operation: string
  ): Promise<RateLimitResult> {
    if (!isRateLimitingEnabled()) {
      return {
        allowed: true,
        remainingRequests: 999999,
        resetTime: Date.now() + 60 * 60 * 1000,
        totalRequests: 0,
      };
    }

    const config = AI_RATE_LIMITS[operation];
    if (!config) {
      throw new Error(
        `No rate limit configuration found for operation: ${operation}`
      );
    }

    const key = `rate_limit:${operation}:${identifier}`;
    const data = await this.store.get(key);
    const now = Date.now();

    if (!data || now - data.windowStart > config.windowMs) {
      return {
        allowed: true,
        remainingRequests: config.maxRequests,
        resetTime: now + config.windowMs,
        totalRequests: 0,
      };
    }

    const isBlocked = data.blockedUntil && now < data.blockedUntil;

    return {
      allowed: !isBlocked && data.requests < config.maxRequests,
      remainingRequests: Math.max(0, config.maxRequests - data.requests),
      resetTime: data.windowStart + config.windowMs,
      retryAfter: isBlocked
        ? Math.ceil((data.blockedUntil! - now) / 1000)
        : undefined,
      totalRequests: data.requests,
    };
  }

  /**
   * Reset rate limit for a user (admin function)
   */
  async resetLimit(identifier: string, operation: string): Promise<boolean> {
    const key = `rate_limit:${operation}:${identifier}`;
    return await this.store.delete(key);
  }
}

// Default rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limiting error class
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
    public resetTime: number,
    public remainingRequests: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Utility function to create user-friendly rate limit messages
 */
export function createRateLimitMessage(
  operation: string,
  result: RateLimitResult
): string {
  const operationNames: Record<string, string> = {
    generateInsight: 'tarot readings',
    generateAdviceForUser: 'personalized advice',
    generateRobsTake: "Rob's commentary",
    generateUserBlockName: 'block names',
  };

  const operationName = operationNames[operation] || 'AI generations';

  if (result.retryAfter) {
    const minutes = Math.ceil(result.retryAfter / 60);
    return `You've reached your limit for ${operationName}. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
  }

  const resetDate = new Date(result.resetTime);
  const resetTime = resetDate.toLocaleTimeString();

  return `You've reached your hourly limit for ${operationName}. Your limit resets at ${resetTime}.`;
}
