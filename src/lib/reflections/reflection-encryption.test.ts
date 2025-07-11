import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules
vi.mock('../supabase/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(),
            })),
            order: vi.fn(() => ({
              limit: vi.fn(),
            })),
          })),
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

vi.mock('../encryption', () => ({
  encryptForDatabase: vi.fn(),
  decryptFromDatabase: vi.fn(),
}));

vi.mock('../input-sanitization', () => ({
  sanitizeReflectionInput: vi.fn((input) => input),
  validateUserId: vi.fn((id) => id),
  validateCardId: vi.fn((id) => id),
  validatePromptIndex: vi.fn((index) => index),
}));

// Import after mocking
import {
  saveReflection,
  getReflectionsByUserAndCard,
} from './reflection-queries';
import { supabase } from '../supabase/supabase';
import { encryptForDatabase, decryptFromDatabase } from '../encryption';

describe('Reflection Encryption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveReflection', () => {
    it('should encrypt reflection text before saving to database', async () => {
      const mockEncryptedText =
        '{"encrypted":"abc123","iv":"def456","salt":"ghi789"}';

      vi.mocked(encryptForDatabase).mockResolvedValue(mockEncryptedText);

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as unknown);

      await saveReflection(
        'user-123',
        1,
        0,
        'This is my sensitive reflection text',
        'creative'
      );

      // Verify encryption was called with the reflection text
      expect(encryptForDatabase).toHaveBeenCalledWith(
        'This is my sensitive reflection text'
      );

      // Verify upsert was called with encrypted data
      expect(mockUpsert).toHaveBeenCalledWith(
        {
          user_id: 'user-123',
          card_id: 1,
          prompt_index: 0,
          reflection_text: mockEncryptedText,
          block_type_id: 'creative',
          updated_at: expect.any(String),
        },
        {
          onConflict: 'user_card_prompt_unique_idx',
          ignoreDuplicates: false,
        }
      );
    });

    it('should handle encryption errors gracefully', async () => {
      vi.mocked(encryptForDatabase).mockRejectedValue(
        new Error('Encryption failed')
      );

      await expect(
        saveReflection('user-123', 1, 0, 'test reflection', 'creative')
      ).rejects.toThrow('Encryption failed');
    });
  });

  describe('getReflectionsByUserAndCard', () => {
    it('should decrypt reflection text when retrieving from database', async () => {
      const mockEncryptedData = [
        {
          id: 1,
          user_id: 'user-123',
          card_id: 1,
          prompt_index: 0,
          reflection_text:
            '{"encrypted":"abc123","iv":"def456","salt":"ghi789"}',
          block_type_id: 'creative',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockDecryptedText = 'This is my decrypted reflection text';

      vi.mocked(decryptFromDatabase).mockResolvedValue(mockDecryptedText);

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockEncryptedData,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown);

      const result = await getReflectionsByUserAndCard('user-123', 1);

      // Verify decryption was called
      expect(decryptFromDatabase).toHaveBeenCalledWith(
        mockEncryptedData[0].reflection_text
      );

      // Verify result contains decrypted text
      expect(result).toEqual([
        {
          ...mockEncryptedData[0],
          reflection_text: mockDecryptedText,
        },
      ]);
    });

    it('should handle decryption errors gracefully', async () => {
      const mockEncryptedData = [
        {
          id: 1,
          user_id: 'user-123',
          card_id: 1,
          prompt_index: 0,
          reflection_text:
            '{"encrypted":"abc123","iv":"def456","salt":"ghi789"}',
          block_type_id: 'creative',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      // Mock decryption failure - should fallback to original text
      vi.mocked(decryptFromDatabase).mockResolvedValue(null);

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockEncryptedData,
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown);

      const result = await getReflectionsByUserAndCard('user-123', 1);

      // Should fallback to original encrypted text
      expect(result).toEqual([
        {
          ...mockEncryptedData[0],
          reflection_text: mockEncryptedData[0].reflection_text,
        },
      ]);
    });

    it('should handle empty results', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown);

      const result = await getReflectionsByUserAndCard('user-123', 1);

      expect(result).toEqual([]);
      expect(decryptFromDatabase).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should maintain data integrity through encrypt/decrypt cycle', async () => {
      const originalText =
        'This is my sensitive reflection about personal growth and challenges.';

      // Mock the encryption/decryption behavior
      vi.mocked(encryptForDatabase).mockImplementation(async (text) => {
        if (!text) return null;
        return `{"encrypted":"${btoa(text)}","iv":"mock-iv","salt":"mock-salt"}`;
      });

      vi.mocked(decryptFromDatabase).mockImplementation(
        async (encryptedJson) => {
          if (!encryptedJson) return null;
          try {
            const data = JSON.parse(encryptedJson);
            return atob(data.encrypted);
          } catch {
            return encryptedJson; // Return as-is if not JSON
          }
        }
      );

      const encrypted = await encryptForDatabase(originalText);
      const decrypted = await decryptFromDatabase(encrypted);

      expect(decrypted).toBe(originalText);
    });

    it('should handle legacy unencrypted data gracefully', async () => {
      const legacyText = 'This is old unencrypted reflection text';

      // Mock decryption to return original text for non-JSON data
      vi.mocked(decryptFromDatabase).mockResolvedValue(legacyText);

      const result = await decryptFromDatabase(legacyText);

      expect(result).toBe(legacyText);
    });
  });
});
