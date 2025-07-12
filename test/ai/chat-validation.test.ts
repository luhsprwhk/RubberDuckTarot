import { describe, it, expect } from 'vitest';
import {
  validateChatMessage,
  CHAT_MESSAGE_LIMITS,
} from '@/src/ai/generate_insight_chat';

describe('Chat Message Validation', () => {
  describe('validateChatMessage', () => {
    it('should validate normal messages', () => {
      const result = validateChatMessage('Hello Rob, can you help me?');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty messages', () => {
      const result = validateChatMessage('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message cannot be empty');
    });

    it('should reject whitespace-only messages', () => {
      const result = validateChatMessage('   \n\t  ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message cannot be empty');
    });

    it('should reject messages that are too long', () => {
      const longMessage = 'a'.repeat(CHAT_MESSAGE_LIMITS.MAX_LENGTH + 1);
      const result = validateChatMessage(longMessage);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        `Message must be ${CHAT_MESSAGE_LIMITS.MAX_LENGTH} characters or less`
      );
    });

    it('should accept messages at the maximum length', () => {
      const maxMessage = 'a'.repeat(CHAT_MESSAGE_LIMITS.MAX_LENGTH);
      const result = validateChatMessage(maxMessage);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject messages with too many lines', () => {
      const manyLines = Array(CHAT_MESSAGE_LIMITS.MAX_LINES + 1)
        .fill('line')
        .join('\n');
      const result = validateChatMessage(manyLines);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        `Message must be ${CHAT_MESSAGE_LIMITS.MAX_LINES} lines or less`
      );
    });

    it('should accept messages at the maximum line count', () => {
      const maxLines =
        'line\n'.repeat(CHAT_MESSAGE_LIMITS.MAX_LINES - 1) + 'last line';
      const result = validateChatMessage(maxLines);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle messages with leading/trailing whitespace', () => {
      const message = '  Valid message  ';
      const result = validateChatMessage(message);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate multiline messages within limits', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      const result = validateChatMessage(multilineMessage);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle edge case with exactly max lines', () => {
      const lines = Array(CHAT_MESSAGE_LIMITS.MAX_LINES)
        .fill('line')
        .join('\n');
      const result = validateChatMessage(lines);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('CHAT_MESSAGE_LIMITS constants', () => {
    it('should have reasonable limits', () => {
      expect(CHAT_MESSAGE_LIMITS.MIN_LENGTH).toBe(1);
      expect(CHAT_MESSAGE_LIMITS.MAX_LENGTH).toBe(1000);
      expect(CHAT_MESSAGE_LIMITS.MAX_LINES).toBe(10);
    });
  });
});
