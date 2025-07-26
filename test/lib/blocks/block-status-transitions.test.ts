import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { UserBlock } from '../../../supabase/schema';

// Mock functions - needs to be hoisted
const { mockEncryptObject, mockDecryptObject, mockSupabase, mockQuery } =
  vi.hoisted(() => {
    const mockEncryptObject = vi.fn();
    const mockDecryptObject = vi.fn();

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };

    return { mockEncryptObject, mockDecryptObject, mockSupabase, mockQuery };
  });

vi.mock('../../../src/lib/encryption', () => ({
  encryptObject: mockEncryptObject,
  decryptObject: mockDecryptObject,
}));

vi.mock('../../../src/lib/supabase/supabase', () => ({
  supabase: mockSupabase,
}));

import {
  updateUserBlockStatus,
  archiveUserBlock,
  getUserBlockById,
  createUserBlock,
  deleteUserBlock,
} from '../../../src/lib/blocks/block-queries';

describe('Block Status Transitions', () => {
  const mockBlock: UserBlock = {
    id: 1,
    user_id: 'user-123',
    block_type_id: 'creative',
    name: 'Test Block',
    status: 'active',
    notes: 'Test notes',
    resolution_reflection: null,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default encryption/decryption behavior
    mockEncryptObject.mockImplementation((obj, fields) => {
      const result = { ...obj };
      fields.forEach((field: string) => {
        if (result[field]) {
          result[field] = `encrypted_${result[field]}`;
        }
      });
      return Promise.resolve(result);
    });

    mockDecryptObject.mockImplementation((obj, fields) => {
      const result = { ...obj };
      fields.forEach((field: string) => {
        if (
          result[field] &&
          typeof result[field] === 'string' &&
          result[field].startsWith('encrypted_')
        ) {
          result[field] = result[field].replace('encrypted_', '');
        }
      });
      return Promise.resolve(result);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.skip('updateUserBlockStatus', () => {
    it('should update block status successfully', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'resolved');

      expect(mockSupabase.from).toHaveBeenCalledWith('user_blocks');
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'resolved',
        updated_at: expect.any(String),
      });
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should update status with notes', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'paused', 'Taking a break');

      expect(mockEncryptObject).toHaveBeenCalledWith(
        { notes: 'Taking a break' },
        ['notes']
      );
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'paused',
        notes: 'encrypted_Taking a break',
        updated_at: expect.any(String),
      });
    });

    it('should update status with reflection', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(
        1,
        'resolved',
        undefined,
        'I found the solution'
      );

      expect(mockEncryptObject).toHaveBeenCalledWith(
        { resolution_reflection: 'I found the solution' },
        ['resolution_reflection']
      );
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'resolved',
        resolution_reflection: 'encrypted_I found the solution',
        updated_at: expect.any(String),
      });
    });

    it('should update status with both notes and reflection', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(
        1,
        'resolved',
        'Final notes',
        'My breakthrough'
      );

      expect(mockEncryptObject).toHaveBeenCalledWith(
        { notes: 'Final notes', resolution_reflection: 'My breakthrough' },
        ['notes', 'resolution_reflection']
      );
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'resolved',
        notes: 'encrypted_Final notes',
        resolution_reflection: 'encrypted_My breakthrough',
        updated_at: expect.any(String),
      });
    });

    it('should handle empty string notes and reflection', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'active', '', '');

      expect(mockEncryptObject).toHaveBeenCalledWith(
        { notes: '', resolution_reflection: '' },
        ['notes', 'resolution_reflection']
      );
    });

    it('should handle update errors', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(updateUserBlockStatus(1, 'resolved')).rejects.toThrow();
    });

    it('should set correct timestamp format', async () => {
      const beforeTime = new Date().toISOString();

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'resolved');

      const afterTime = new Date().toISOString();
      const updateCall = mockQuery.update.mock.calls[0][0];

      expect(updateCall.updated_at).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(updateCall.updated_at >= beforeTime).toBe(true);
      expect(updateCall.updated_at <= afterTime).toBe(true);
    });
  });

  describe.skip('archiveUserBlock', () => {
    it('should archive block without reflection', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await archiveUserBlock(1);

      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'archived',
        updated_at: expect.any(String),
      });
    });

    it('should archive block with reflection', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await archiveUserBlock(1, 'This was a great learning experience');

      expect(mockEncryptObject).toHaveBeenCalledWith(
        { resolution_reflection: 'This was a great learning experience' },
        ['resolution_reflection']
      );
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'archived',
        resolution_reflection: 'encrypted_This was a great learning experience',
        updated_at: expect.any(String),
      });
    });

    it('should handle archiving errors', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Archive failed' },
      });

      await expect(archiveUserBlock(1, 'reflection')).rejects.toThrow();
    });
  });

  describe.skip('Status Transition Validations', () => {
    it('should allow valid status transitions', async () => {
      const validStatuses = ['active', 'paused', 'resolved', 'archived'];

      for (const status of validStatuses) {
        mockQuery.single.mockResolvedValueOnce({
          data: null,
          error: null,
        });

        await updateUserBlockStatus(1, status);

        expect(mockQuery.update).toHaveBeenCalledWith(
          expect.objectContaining({ status })
        );
      }
    });

    it('should handle status transitions from active to resolved', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'resolved', undefined, 'Problem solved');

      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'resolved',
        resolution_reflection: 'encrypted_Problem solved',
        updated_at: expect.any(String),
      });
    });

    it('should handle status transitions from active to paused', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'paused', 'Need a break');

      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'paused',
        notes: 'encrypted_Need a break',
        updated_at: expect.any(String),
      });
    });

    it('should handle status transitions from resolved to archived', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await archiveUserBlock(1, 'Archiving this resolved block');

      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'archived',
        resolution_reflection: 'encrypted_Archiving this resolved block',
        updated_at: expect.any(String),
      });
    });
  });

  describe.skip('Block Lifecycle Management', () => {
    it('should create block with initial active status', async () => {
      const newBlock = {
        user_id: 'user-123',
        block_type_id: 'creative',
        name: 'New Block',
        status: 'active' as const,
        notes: 'Initial notes',
        resolution_reflection: null,
      };

      mockQuery.single.mockResolvedValueOnce({
        data: {
          ...newBlock,
          id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        error: null,
      });

      const result = await createUserBlock(newBlock);

      expect(mockEncryptObject).toHaveBeenCalledWith(newBlock, [
        'name',
        'notes',
        'resolution_reflection',
      ]);
      expect(mockQuery.insert).toHaveBeenCalled();
      expect(result.status).toBe('active');
    });

    it('should retrieve block with current status', async () => {
      const dbBlock = {
        ...mockBlock,
        name: 'encrypted_Test Block',
        notes: 'encrypted_Test notes',
      };

      mockQuery.single.mockResolvedValueOnce({
        data: dbBlock,
        error: null,
      });

      const result = await getUserBlockById(1);

      expect(mockDecryptObject).toHaveBeenCalledWith(dbBlock, [
        'name',
        'notes',
        'resolution_reflection',
      ]);
      expect(result?.name).toBe('Test Block');
      expect(result?.notes).toBe('Test notes');
    });

    it('should handle block not found', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      });

      const result = await getUserBlockById(999);

      expect(result).toBe(null);
    });

    it('should delete block completely', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await deleteUserBlock(1);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_blocks');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should handle delete errors', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Delete failed' },
      });

      await expect(deleteUserBlock(1)).rejects.toThrow();
    });
  });

  describe.skip('Data Integrity', () => {
    it('should preserve block ID during status updates', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(42, 'resolved');

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 42);
    });

    it('should handle encryption failures gracefully', async () => {
      mockEncryptObject.mockRejectedValueOnce(new Error('Encryption failed'));

      await expect(
        updateUserBlockStatus(1, 'resolved', 'notes', 'reflection')
      ).rejects.toThrow('Encryption failed');
    });

    it('should handle decryption failures gracefully in getUserBlockById', async () => {
      const dbBlock = { ...mockBlock, name: 'encrypted_Test Block' };

      mockQuery.single.mockResolvedValueOnce({
        data: dbBlock,
        error: null,
      });

      mockDecryptObject.mockRejectedValueOnce(new Error('Decryption failed'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getUserBlockById(1);

      expect(result).toEqual(dbBlock); // Should return encrypted data as fallback
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to decrypt user block by ID:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should not update timestamp when no changes are made', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'active');

      const updateCall = mockQuery.update.mock.calls[0][0];
      expect(updateCall).toHaveProperty('updated_at');
      expect(updateCall).toHaveProperty('status', 'active');
      // Should only have status and updated_at
      expect(Object.keys(updateCall)).toEqual(['status', 'updated_at']);
    });
  });

  describe.skip('Edge Cases', () => {
    it('should handle very long reflection text', async () => {
      const longReflection = 'a'.repeat(10000);

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'resolved', undefined, longReflection);

      expect(mockEncryptObject).toHaveBeenCalledWith(
        { resolution_reflection: longReflection },
        ['resolution_reflection']
      );
    });

    it('should handle special characters in notes and reflection', async () => {
      const specialText = '特殊字符 émojis 🎉 <script>alert("xss")</script>';

      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'resolved', specialText, specialText);

      expect(mockEncryptObject).toHaveBeenCalledWith(
        { notes: specialText, resolution_reflection: specialText },
        ['notes', 'resolution_reflection']
      );
    });

    it('should handle null values for optional fields', async () => {
      mockQuery.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await updateUserBlockStatus(1, 'active', undefined, undefined);

      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'active',
        updated_at: expect.any(String),
      });
      expect(mockEncryptObject).not.toHaveBeenCalled();
    });

    it('should handle concurrent status updates', async () => {
      const promises = [
        updateUserBlockStatus(1, 'paused'),
        updateUserBlockStatus(1, 'resolved'),
        updateUserBlockStatus(1, 'archived'),
      ];

      // Mock all queries to succeed
      mockQuery.single
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      await Promise.all(promises);

      expect(mockQuery.update).toHaveBeenCalledTimes(3);
    });
  });
});
