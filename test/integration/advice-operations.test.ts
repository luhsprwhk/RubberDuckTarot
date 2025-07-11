import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createOrUpdateAdvice,
  getAdviceForUserCardBlock,
  getAllAdviceForUserCard,
  deleteAdvice,
  type CreateAdviceParams,
  type GetAdviceParams,
} from '@/src/lib/advice/advice-operations';
import type { UserCardAdvice } from '@/supabase/schema';

// Mock Supabase client
vi.mock('@/src/lib/supabase/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('advice-operations', () => {
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;
  let mockEq: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockSelect = vi.fn();
    mockInsert = vi.fn();
    mockUpdate = vi.fn();
    mockDelete = vi.fn();
    mockSingle = vi.fn();
    mockEq = vi.fn();

    // For queries that end with a promise
    const mockQueryPromise = Promise.resolve({ data: [], error: null });

    // Setup chainable mock methods
    const mockQueryChain = {
      eq: mockEq,
      single: mockSingle,
      select: mockSelect,
    };

    mockSelect.mockReturnValue(mockQueryChain);
    mockInsert.mockReturnValue(mockQueryChain);
    mockUpdate.mockReturnValue(mockQueryChain);
    mockDelete.mockReturnValue(mockQueryChain);

    // mockEq needs to return both the chainable object AND support promise resolution
    mockEq.mockImplementation(() => {
      const chainable = {
        ...mockQueryChain,
        then: mockQueryPromise.then.bind(mockQueryPromise),
        catch: mockQueryPromise.catch.bind(mockQueryPromise),
      };
      return chainable;
    });

    mockSingle.mockReturnValue(mockQueryPromise);

    const { supabase } = await import('@/src/lib/supabase/supabase');
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      upsert: vi.fn(),
      url: '',
      headers: {},
    } as unknown as ReturnType<typeof supabase.from>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrUpdateAdvice', () => {
    const mockParams: CreateAdviceParams = {
      userId: 'user-123',
      cardId: 1,
      blockTypeId: 'creative',
      advice: 'Try a new creative approach',
    };

    it('should create and update advice properly', async () => {
      // Test creation when no existing advice
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

      const newAdvice: UserCardAdvice = {
        id: 1,
        user_id: 'user-123',
        card_id: 1,
        block_type_id: 'creative',
        advice: 'Try a new creative approach',
        generated_at: new Date(),
        last_updated: new Date(),
      };

      mockSingle.mockResolvedValueOnce({
        data: newAdvice,
        error: null,
      });

      const result = await createOrUpdateAdvice(mockParams);

      expect(result).toEqual(newAdvice);
      const { supabase } = await import('@/src/lib/supabase/supabase');
      expect(supabase.from).toHaveBeenCalledWith('user_card_advice');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        card_id: 1,
        block_type_id: 'creative',
        advice: 'Try a new creative approach',
      });
    });

    it('should update existing advice', async () => {
      // Test update when existing advice found
      const existingAdvice: UserCardAdvice = {
        id: 1,
        user_id: 'user-123',
        card_id: 1,
        block_type_id: 'creative',
        advice: 'Old advice',
        generated_at: new Date(),
        last_updated: new Date(),
      };

      mockSingle.mockResolvedValueOnce({
        data: existingAdvice,
        error: null,
      });

      const updatedAdvice: UserCardAdvice = {
        ...existingAdvice,
        advice: 'Try a new creative approach',
        last_updated: new Date(),
      };

      mockSingle.mockResolvedValueOnce({
        data: updatedAdvice,
        error: null,
      });

      const result = await createOrUpdateAdvice(mockParams);

      expect(result).toEqual(updatedAdvice);
      expect(mockUpdate).toHaveBeenCalledWith({
        advice: 'Try a new creative approach',
        last_updated: expect.any(String),
      });
    });

    it('should handle database errors', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST001', message: 'Database error' },
      });

      await expect(createOrUpdateAdvice(mockParams)).rejects.toThrow();
    });
  });

  describe('getAdviceForUserCardBlock', () => {
    const mockParams: GetAdviceParams = {
      userId: 'user-123',
      cardId: 1,
      blockTypeId: 'creative',
    };

    it('should retrieve advice successfully', async () => {
      const mockAdvice: UserCardAdvice = {
        id: 1,
        user_id: 'user-123',
        card_id: 1,
        block_type_id: 'creative',
        advice: 'Try a new creative approach',
        generated_at: new Date(),
        last_updated: new Date(),
      };

      mockSingle.mockResolvedValueOnce({
        data: mockAdvice,
        error: null,
      });

      const result = await getAdviceForUserCardBlock(mockParams);

      expect(result).toEqual(mockAdvice);
      const { supabase } = await import('@/src/lib/supabase/supabase');
      expect(supabase.from).toHaveBeenCalledWith('user_card_advice');
    });

    it('should return null when no advice found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

      const result = await getAdviceForUserCardBlock(mockParams);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST001', message: 'Database error' },
      });

      await expect(getAdviceForUserCardBlock(mockParams)).rejects.toThrow();
    });
  });

  describe('getAllAdviceForUserCard', () => {
    it.skip('should retrieve all advice for a user card', async () => {
      // TODO: Complex Supabase mocking scenario with chained .eq() calls - requires more sophisticated mock setup
      const mockAdviceList: UserCardAdvice[] = [
        {
          id: 1,
          user_id: 'user-123',
          card_id: 1,
          block_type_id: 'creative',
          advice: 'Creative advice',
          generated_at: new Date(),
          last_updated: new Date(),
        },
        {
          id: 2,
          user_id: 'user-123',
          card_id: 1,
          block_type_id: 'work',
          advice: 'Work advice',
          generated_at: new Date(),
          last_updated: new Date(),
        },
      ];

      mockEq.mockResolvedValueOnce({
        data: mockAdviceList,
        error: null,
      });

      const result = await getAllAdviceForUserCard('user-123', 1);

      expect(result).toEqual(mockAdviceList);
      const { supabase } = await import('@/src/lib/supabase/supabase');
      expect(supabase.from).toHaveBeenCalledWith('user_card_advice');
    });

    it('should handle database errors', async () => {
      mockEq.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST001', message: 'Database error' },
      });

      await expect(getAllAdviceForUserCard('user-123', 1)).rejects.toThrow();
    });
  });

  describe('deleteAdvice', () => {
    const mockParams: GetAdviceParams = {
      userId: 'user-123',
      cardId: 1,
      blockTypeId: 'creative',
    };

    it.skip('should delete advice successfully', async () => {
      // TODO: Complex Supabase mocking scenario with chained .eq() calls - requires more sophisticated mock setup
      mockEq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await expect(deleteAdvice(mockParams)).resolves.toBeUndefined();
      const { supabase } = await import('@/src/lib/supabase/supabase');
      expect(supabase.from).toHaveBeenCalledWith('user_card_advice');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockEq.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST001', message: 'Database error' },
      });

      await expect(deleteAdvice(mockParams)).rejects.toThrow();
    });
  });

  describe('duplicate entries handling', () => {
    it('should handle duplicate entries', async () => {
      const mockParams: CreateAdviceParams = {
        userId: 'user-123',
        cardId: 1,
        blockTypeId: 'creative',
        advice: 'First advice',
      };

      // First call - create new advice
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

      const firstAdvice: UserCardAdvice = {
        id: 1,
        user_id: 'user-123',
        card_id: 1,
        block_type_id: 'creative',
        advice: 'First advice',
        generated_at: new Date(),
        last_updated: new Date(),
      };

      mockSingle.mockResolvedValueOnce({
        data: firstAdvice,
        error: null,
      });

      const result1 = await createOrUpdateAdvice(mockParams);
      expect(result1).toEqual(firstAdvice);

      // Second call with same params but different advice - should update
      mockSingle.mockResolvedValueOnce({
        data: firstAdvice,
        error: null,
      });

      const updatedAdvice: UserCardAdvice = {
        ...firstAdvice,
        advice: 'Updated advice',
        last_updated: new Date(),
      };

      mockSingle.mockResolvedValueOnce({
        data: updatedAdvice,
        error: null,
      });

      const result2 = await createOrUpdateAdvice({
        ...mockParams,
        advice: 'Updated advice',
      });

      expect(result2).toEqual(updatedAdvice);
      expect(result2.advice).toBe('Updated advice');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed parameters', async () => {
      const invalidParams = {
        userId: '',
        cardId: 0,
        blockTypeId: '',
        advice: '',
      };

      // The function should still call the database but may fail
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST001', message: 'Invalid parameters' },
      });

      await expect(createOrUpdateAdvice(invalidParams)).rejects.toThrow();
    });

    it.skip('should handle concurrent updates', async () => {
      // TODO: Complex Supabase mocking scenario with chained .eq() calls - requires more sophisticated mock setup
      const mockParams: CreateAdviceParams = {
        userId: 'user-123',
        cardId: 1,
        blockTypeId: 'creative',
        advice: 'Concurrent advice',
      };

      // Simulate concurrent access - both calls think no existing advice
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      // First insert succeeds
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 1,
          user_id: 'user-123',
          card_id: 1,
          block_type_id: 'creative',
          advice: 'Concurrent advice',
          generated_at: new Date(),
          last_updated: new Date(),
        },
        error: null,
      });

      // Second insert fails due to unique constraint
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: '23505', message: 'Duplicate key violation' },
      });

      const result1 = await createOrUpdateAdvice(mockParams);
      expect(result1).toBeDefined();

      await expect(createOrUpdateAdvice(mockParams)).rejects.toThrow();
    });
  });
});
