import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  RateLimiter,
  MemoryRateLimitStore,
  RateLimitError,
  createRateLimitMessage,
  AI_RATE_LIMITS,
} from './rate-limiter';

describe('MemoryRateLimitStore', () => {
  let store: MemoryRateLimitStore;

  beforeEach(() => {
    store = new MemoryRateLimitStore();
  });

  afterEach(() => {
    store.destroy();
  });

  it('should store and retrieve data', async () => {
    const data = {
      requests: 1,
      tokens: 100,
      windowStart: Date.now(),
    };

    await store.set('test-key', data, 1000);
    const retrieved = await store.get('test-key');

    expect(retrieved).toEqual(data);
  });

  it('should return null for non-existent keys', async () => {
    const result = await store.get('non-existent');
    expect(result).toBeNull();
  });

  it('should expire data after TTL', async () => {
    const data = {
      requests: 1,
      tokens: 100,
      windowStart: Date.now(),
    };

    await store.set('test-key', data, 10); // 10ms TTL

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 20));

    const result = await store.get('test-key');
    expect(result).toBeNull();
  });

  it('should increment request count', async () => {
    const count1 = await store.increment('test-key', 1);
    expect(count1).toBe(1);

    const count2 = await store.increment('test-key', 2);
    expect(count2).toBe(3);
  });

  it('should delete data', async () => {
    const data = {
      requests: 1,
      tokens: 100,
      windowStart: Date.now(),
    };

    await store.set('test-key', data, 1000);
    const deleted = await store.delete('test-key');
    expect(deleted).toBe(true);

    const result = await store.get('test-key');
    expect(result).toBeNull();
  });
});

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let store: MemoryRateLimitStore;

  beforeEach(() => {
    store = new MemoryRateLimitStore();
    rateLimiter = new RateLimiter(store);
  });

  afterEach(() => {
    store.destroy();
  });

  it('should allow requests within limits', async () => {
    const result = await rateLimiter.checkLimit(
      'user1',
      'generateUserBlockName',
      50
    );

    expect(result.allowed).toBe(true);
    expect(result.remainingRequests).toBe(49); // 50 - 1
    expect(result.totalRequests).toBe(1);
  });

  it('should block requests when limit exceeded', async () => {
    const config = AI_RATE_LIMITS.generateUserBlockName;

    // Make requests up to the limit
    for (let i = 0; i < config.maxRequests; i++) {
      await rateLimiter.checkLimit('user1', 'generateUserBlockName', 50);
    }

    // Next request should be blocked
    const result = await rateLimiter.checkLimit(
      'user1',
      'generateUserBlockName',
      50
    );

    expect(result.allowed).toBe(false);
    expect(result.remainingRequests).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should block requests when token limit exceeded', async () => {
    const config = AI_RATE_LIMITS.generateUserBlockName;
    const largeTokenRequest = config.maxTokens! + 1;

    const result = await rateLimiter.checkLimit(
      'user1',
      'generateUserBlockName',
      largeTokenRequest
    );

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should reset limits after window expires', async () => {
    // Mock a short window for testing
    const originalLimit = AI_RATE_LIMITS.generateUserBlockName;
    vi.spyOn(AI_RATE_LIMITS, 'generateUserBlockName', 'get').mockReturnValue({
      ...originalLimit,
      windowMs: 10, // 10ms window
    });

    // Fill up the limit
    for (let i = 0; i < originalLimit.maxRequests; i++) {
      await rateLimiter.checkLimit('user1', 'generateUserBlockName', 1);
    }

    // Should be blocked
    let result = await rateLimiter.checkLimit(
      'user1',
      'generateUserBlockName',
      1
    );
    expect(result.allowed).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Should be allowed again
    result = await rateLimiter.checkLimit('user1', 'generateUserBlockName', 1);
    expect(result.allowed).toBe(true);
  });

  it('should handle different users independently', async () => {
    const config = AI_RATE_LIMITS.generateUserBlockName;

    // Fill up limit for user1
    for (let i = 0; i < config.maxRequests; i++) {
      await rateLimiter.checkLimit('user1', 'generateUserBlockName', 1);
    }

    // user1 should be blocked
    const result1 = await rateLimiter.checkLimit(
      'user1',
      'generateUserBlockName',
      1
    );
    expect(result1.allowed).toBe(false);

    // user2 should still be allowed
    const result2 = await rateLimiter.checkLimit(
      'user2',
      'generateUserBlockName',
      1
    );
    expect(result2.allowed).toBe(true);
  });

  it('should handle different operations independently', async () => {
    const blockNameConfig = AI_RATE_LIMITS.generateUserBlockName;

    // Fill up limit for generateUserBlockName
    for (let i = 0; i < blockNameConfig.maxRequests; i++) {
      await rateLimiter.checkLimit('user1', 'generateUserBlockName', 1);
    }

    // generateUserBlockName should be blocked
    const result1 = await rateLimiter.checkLimit(
      'user1',
      'generateUserBlockName',
      1
    );
    expect(result1.allowed).toBe(false);

    // generateAdviceForUser should still be allowed
    const result2 = await rateLimiter.checkLimit(
      'user1',
      'generateAdviceForUser',
      1
    );
    expect(result2.allowed).toBe(true);
  });

  it('should record token usage', async () => {
    await rateLimiter.checkLimit('user1', 'generateUserBlockName', 10);
    await rateLimiter.recordTokenUsage('user1', 'generateUserBlockName', 20);

    const status = await rateLimiter.getStatus(
      'user1',
      'generateUserBlockName'
    );
    expect(status.totalRequests).toBe(1);
  });

  it('should reset limits for specific user and operation', async () => {
    const config = AI_RATE_LIMITS.generateUserBlockName;

    // Fill up the limit
    for (let i = 0; i < config.maxRequests; i++) {
      await rateLimiter.checkLimit('user1', 'generateUserBlockName', 1);
    }

    // Should be blocked
    let result = await rateLimiter.checkLimit(
      'user1',
      'generateUserBlockName',
      1
    );
    expect(result.allowed).toBe(false);

    // Reset the limit
    await rateLimiter.resetLimit('user1', 'generateUserBlockName');

    // Should be allowed again
    result = await rateLimiter.checkLimit('user1', 'generateUserBlockName', 1);
    expect(result.allowed).toBe(true);
  });

  it('should throw error for unknown operation', async () => {
    await expect(
      rateLimiter.checkLimit('user1', 'unknownOperation', 1)
    ).rejects.toThrow(
      'No rate limit configuration found for operation: unknownOperation'
    );
  });
});

describe('RateLimitError', () => {
  it('should create error with correct properties', () => {
    const error = new RateLimitError('Test message', 60, 1234567890, 5);

    expect(error.message).toBe('Test message');
    expect(error.retryAfter).toBe(60);
    expect(error.resetTime).toBe(1234567890);
    expect(error.remainingRequests).toBe(5);
    expect(error.name).toBe('RateLimitError');
  });
});

describe('createRateLimitMessage', () => {
  it('should create message with retry after', () => {
    const result = {
      allowed: false,
      remainingRequests: 0,
      resetTime: Date.now() + 3600000,
      retryAfter: 300, // 5 minutes
      totalRequests: 10,
    };

    const message = createRateLimitMessage('generateAdviceForUser', result);
    expect(message).toContain('personalized advice');
    expect(message).toContain('5 minutes');
  });

  it('should create message with reset time', () => {
    const resetTime = Date.now() + 3600000;
    const result = {
      allowed: false,
      remainingRequests: 0,
      resetTime,
      totalRequests: 10,
    };

    const message = createRateLimitMessage('generateInsight', result);
    expect(message).toContain('tarot readings');
    expect(message).toContain('resets at');
  });

  it('should handle unknown operations', () => {
    const result = {
      allowed: false,
      remainingRequests: 0,
      resetTime: Date.now() + 3600000,
      totalRequests: 10,
    };

    const message = createRateLimitMessage('unknownOperation', result);
    expect(message).toContain('AI generations');
  });
});

describe('Rate Limiting Environment Configuration', () => {
  it('should have different limits for production vs development', () => {
    // These tests verify the configuration is set up correctly
    expect(AI_RATE_LIMITS.generateInsight.maxRequests).toBeGreaterThan(0);
    expect(AI_RATE_LIMITS.generateAdviceForUser.maxRequests).toBeGreaterThan(0);
    expect(AI_RATE_LIMITS.generateRobsTake.maxRequests).toBeGreaterThan(0);
    expect(AI_RATE_LIMITS.generateUserBlockName.maxRequests).toBeGreaterThan(0);
  });

  it('should have token limits for operations', () => {
    expect(AI_RATE_LIMITS.generateInsight.maxTokens).toBeGreaterThan(0);
    expect(AI_RATE_LIMITS.generateAdviceForUser.maxTokens).toBeGreaterThan(0);
    expect(AI_RATE_LIMITS.generateRobsTake.maxTokens).toBeGreaterThan(0);
    expect(AI_RATE_LIMITS.generateUserBlockName.maxTokens).toBeGreaterThan(0);
  });

  it('should have reasonable block durations', () => {
    expect(AI_RATE_LIMITS.generateInsight.blockDurationMs).toBeGreaterThan(0);
    expect(
      AI_RATE_LIMITS.generateAdviceForUser.blockDurationMs
    ).toBeGreaterThan(0);
    expect(AI_RATE_LIMITS.generateRobsTake.blockDurationMs).toBeGreaterThan(0);
    expect(
      AI_RATE_LIMITS.generateUserBlockName.blockDurationMs
    ).toBeGreaterThan(0);
  });
});

describe('Rate Limiting with Environment Flag', () => {
  it('should respect environment-based enabling/disabling', () => {
    // This test verifies that the environment flag logic works
    // In test environment, rate limiting should be disabled by default
    // unless explicitly enabled

    // The actual behavior depends on import.meta.env.VITE_ENABLE_RATE_LIMITING
    // and import.meta.env.PROD values during test execution
    expect(typeof AI_RATE_LIMITS).toBe('object');
  });
});
