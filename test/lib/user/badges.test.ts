import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase - needs to be hoisted
const { mockSupabase, mockQuery } = vi.hoisted(() => {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis(),
    count: 'exact' as const,
    head: true,
  };

  const mockSupabase = {
    from: vi.fn().mockReturnValue(mockQuery),
  };

  return { mockSupabase, mockQuery };
});

vi.mock('../../../src/lib/supabase/supabase', () => ({
  supabase: mockSupabase,
}));

import {
  awardBadge,
  getUserBadges,
  checkAndAwardBlockBadges,
  BADGES,
  BADGE_METADATA,
  type Badge,
} from '../../../src/lib/user/badges';

describe('Badge System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Badge Constants', () => {
    it('should have all required badge constants', () => {
      expect(BADGES.FIRST_BLOCK_RESOLVED).toBe('first-block-resolved');
      expect(BADGES.FIVE_BLOCKS_RESOLVED).toBe('five-blocks-resolved');
      expect(BADGES.FIRST_INSIGHT).toBe('first-insight');
      expect(BADGES.CHAT_WITH_ROB).toBe('chat-with-rob');
    });

    it('should have metadata for all badges', () => {
      Object.values(BADGES).forEach((badge) => {
        expect(BADGE_METADATA[badge]).toBeDefined();
        expect(BADGE_METADATA[badge].name).toBeTruthy();
        expect(BADGE_METADATA[badge].description).toBeTruthy();
        expect(BADGE_METADATA[badge].emoji).toBeTruthy();
      });
    });

    it('should have correct badge metadata', () => {
      expect(BADGE_METADATA[BADGES.FIRST_BLOCK_RESOLVED]).toEqual({
        name: 'Block Breaker',
        description: 'Resolved your first block',
        emoji: '🎯',
      });

      expect(BADGE_METADATA[BADGES.FIVE_BLOCKS_RESOLVED]).toEqual({
        name: 'Debugging Dynamo',
        description: 'Resolved 5 blocks',
        emoji: '🚀',
      });

      expect(BADGE_METADATA[BADGES.FIRST_INSIGHT]).toEqual({
        name: 'First Steps',
        description: 'Got your first insight from Rob',
        emoji: '🦆',
      });

      expect(BADGE_METADATA[BADGES.CHAT_WITH_ROB]).toEqual({
        name: 'Deep Dive',
        description: 'Had a conversation with Rob',
        emoji: '💬',
      });
    });
  });

  describe.skip('awardBadge', () => {
    const userId = 'user-123';
    const badge = BADGES.FIRST_BLOCK_RESOLVED;

    it.skip('should award a new badge successfully', async () => {
      const mockUser = { badges: [] };

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await awardBadge(userId, badge);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.select).toHaveBeenCalledWith('badges');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', userId);
      expect(mockQuery.update).toHaveBeenCalledWith({
        badges: [badge],
      });
    });

    it.skip('should not award a badge that user already has', async () => {
      const mockUser = { badges: [badge] };

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      const result = await awardBadge(userId, badge);

      expect(result).toBe(false);
      expect(mockQuery.update).not.toHaveBeenCalled();
    });

    it.skip('should handle null badges array', async () => {
      const mockUser = { badges: null };

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await awardBadge(userId, badge);

      expect(result).toBe(true);
      expect(mockQuery.update).toHaveBeenCalledWith({
        badges: [badge],
      });
    });

    it('should handle undefined badges array', async () => {
      const mockUser = {};

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await awardBadge(userId, badge);

      expect(result).toBe(true);
      expect(mockQuery.update).toHaveBeenCalledWith({
        badges: [badge],
      });
    });

    it('should add badge to existing badges', async () => {
      const mockUser = { badges: [BADGES.FIRST_INSIGHT] };

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await awardBadge(userId, badge);

      expect(result).toBe(true);
      expect(mockQuery.update).toHaveBeenCalledWith({
        badges: [BADGES.FIRST_INSIGHT, badge],
      });
    });

    it('should handle fetch error', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' },
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await awardBadge(userId, badge);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user badges:', {
        message: 'User not found',
      });
      expect(mockQuery.update).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle update error', async () => {
      const mockUser = { badges: [] };

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await awardBadge(userId, badge);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error updating user badges:', {
        message: 'Update failed',
      });

      consoleSpy.mockRestore();
    });

    it('should handle unexpected exceptions', async () => {
      mockQuery.single.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await awardBadge(userId, badge);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in awardBadge:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe.skip('getUserBadges', () => {
    const userId = 'user-123';

    it('should return user badges successfully', async () => {
      const mockUser = {
        badges: [BADGES.FIRST_BLOCK_RESOLVED, BADGES.FIRST_INSIGHT],
      };

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      const result = await getUserBadges(userId);

      expect(result).toEqual([
        BADGES.FIRST_BLOCK_RESOLVED,
        BADGES.FIRST_INSIGHT,
      ]);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockQuery.select).toHaveBeenCalledWith('badges');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', userId);
    });

    it('should return empty array when user has no badges', async () => {
      const mockUser = { badges: null };

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      const result = await getUserBadges(userId);

      expect(result).toEqual([]);
    });

    it('should return empty array when badges property is missing', async () => {
      const mockUser = {};

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      const result = await getUserBadges(userId);

      expect(result).toEqual([]);
    });

    it('should handle fetch error', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' },
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getUserBadges(userId);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching user badges:', {
        message: 'User not found',
      });

      consoleSpy.mockRestore();
    });

    it('should handle unexpected exceptions', async () => {
      mockQuery.single.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getUserBadges(userId);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in getUserBadges:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe.skip('checkAndAwardBlockBadges', () => {
    const userId = 'user-123';

    beforeEach(() => {
      // Set up a separate mock for the count query
      const mockCountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Return different query objects for different table calls
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'user_blocks') {
          return mockCountQuery;
        }
        return mockQuery;
      });
    });

    it('should award first block badge when user resolves first block', async () => {
      // Mock count query for resolved blocks - need to mock the chain properly
      const mockCountQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      // Set up the mock to return different objects for different table calls
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'user_blocks') {
          // For count query - second eq call returns the count result
          mockCountQuery.eq
            .mockReturnValueOnce(mockCountQuery)
            .mockReturnValueOnce({
              count: 1,
              error: null,
            });
          return mockCountQuery;
        }
        return mockQuery; // for users table
      });

      // Mock user fetch and update for badge awarding
      mockQuery.single
        .mockResolvedValueOnce({ data: { badges: [] }, error: null }) // fetch current badges
        .mockResolvedValueOnce({ data: null, error: null }); // update badges

      const result = await checkAndAwardBlockBadges(userId);

      expect(result).toEqual([BADGES.FIRST_BLOCK_RESOLVED]);
    });

    it('should award five blocks badge when user resolves 5th block', async () => {
      // Mock count query for resolved blocks
      const mockCountQuery = mockSupabase.from('user_blocks');
      mockCountQuery.eq.mockReturnValueOnce({
        count: 5,
        error: null,
      });

      // Mock user fetch and update for badge awarding
      mockQuery.single
        .mockResolvedValueOnce({
          data: { badges: [BADGES.FIRST_BLOCK_RESOLVED] },
          error: null,
        }) // fetch current badges
        .mockResolvedValueOnce({ data: null, error: null }); // update badges

      const result = await checkAndAwardBlockBadges(userId);

      expect(result).toEqual([BADGES.FIVE_BLOCKS_RESOLVED]);
    });

    it('should not award badges if user already has them', async () => {
      // Mock count query for resolved blocks
      const mockCountQuery = mockSupabase.from('user_blocks');
      mockCountQuery.eq.mockReturnValueOnce({
        count: 1,
        error: null,
      });

      // Mock user fetch showing they already have the badge
      mockQuery.single.mockResolvedValueOnce({
        data: { badges: [BADGES.FIRST_BLOCK_RESOLVED] },
        error: null,
      });

      const result = await checkAndAwardBlockBadges(userId);

      expect(result).toEqual([]);
    });

    it('should return empty array when count is not 1 or 5', async () => {
      // Mock count query for resolved blocks
      const mockCountQuery = mockSupabase.from('user_blocks');
      mockCountQuery.eq.mockReturnValueOnce({
        count: 3,
        error: null,
      });

      const result = await checkAndAwardBlockBadges(userId);

      expect(result).toEqual([]);
    });

    it('should handle count query error', async () => {
      // Mock count query error
      const mockCountQuery = mockSupabase.from('user_blocks');
      mockCountQuery.eq.mockReturnValueOnce({
        count: null,
        error: { message: 'Count query failed' },
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await checkAndAwardBlockBadges(userId);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error counting resolved blocks:',
        { message: 'Count query failed' }
      );

      consoleSpy.mockRestore();
    });

    it('should handle unexpected exceptions', async () => {
      // Mock count query to throw
      const mockCountQuery = mockSupabase.from('user_blocks');
      mockCountQuery.eq.mockImplementation(() => {
        throw new Error('Network error');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await checkAndAwardBlockBadges(userId);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in checkAndAwardBlockBadges:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should query the correct table and conditions', async () => {
      // Mock count query for resolved blocks
      const mockCountQuery = mockSupabase.from('user_blocks');
      mockCountQuery.eq.mockReturnValueOnce({
        count: 0,
        error: null,
      });

      await checkAndAwardBlockBadges(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_blocks');
      expect(mockCountQuery.select).toHaveBeenCalledWith('id', {
        count: 'exact',
        head: true,
      });
      expect(mockCountQuery.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockCountQuery.eq).toHaveBeenCalledWith('status', 'resolved');
    });

    it('should handle null count', async () => {
      // Mock count query returning null
      const mockCountQuery = mockSupabase.from('user_blocks');
      mockCountQuery.eq.mockReturnValueOnce({
        count: null,
        error: null,
      });

      const result = await checkAndAwardBlockBadges(userId);

      expect(result).toEqual([]);
    });

    it('should handle zero count', async () => {
      // Mock count query returning 0
      const mockCountQuery = mockSupabase.from('user_blocks');
      mockCountQuery.eq.mockReturnValueOnce({
        count: 0,
        error: null,
      });

      const result = await checkAndAwardBlockBadges(userId);

      expect(result).toEqual([]);
    });
  });

  describe.skip('Edge Cases', () => {
    it('should handle very large badge arrays', async () => {
      const userId = 'user-123';
      const badge = BADGES.FIRST_BLOCK_RESOLVED;
      const largeBadgeArray = Array(1000)
        .fill(0)
        .map((_, i) => `badge-${i}`);

      const mockUser = { badges: largeBadgeArray };

      mockQuery.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await awardBadge(userId, badge);

      expect(result).toBe(true);
      expect(mockQuery.update).toHaveBeenCalledWith({
        badges: [...largeBadgeArray, badge],
      });
    });

    it('should handle badge type checking', () => {
      const validBadge: Badge = BADGES.FIRST_BLOCK_RESOLVED;
      expect(validBadge).toBe('first-block-resolved');

      // This should be a compile-time error, but we can't test that in runtime
      // const invalidBadge: Badge = 'invalid-badge';
    });
  });
});
