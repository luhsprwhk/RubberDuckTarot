import { describe, it, expect } from 'vitest';
import {
  cleanupOldMessages,
  trimMessageHistory,
  getContextMessages,
  CONVERSATION_LIMITS,
} from '@/src/ai/generate_insight_chat';

// Helper function to create test messages
const createMessage = (
  id: string,
  role: 'user' | 'assistant',
  hoursAgo: number = 0
) => ({
  id,
  role,
  content: `Test message ${id}`,
  timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
});

describe('Conversation Cleanup Mechanisms', () => {
  describe('cleanupOldMessages', () => {
    it('should remove messages older than MAX_MESSAGE_AGE_HOURS', () => {
      const messages = [
        createMessage('old1', 'user', 48), // 48 hours ago - should be removed
        createMessage('old2', 'assistant', 25), // 25 hours ago - should be removed
        createMessage('recent1', 'user', 12), // 12 hours ago - should be kept
        createMessage('recent2', 'assistant', 1), // 1 hour ago - should be kept
        createMessage('recent3', 'user', 0), // now - should be kept
      ];

      const cleaned = cleanupOldMessages(messages);

      expect(cleaned).toHaveLength(3);
      expect(cleaned.map((m) => m.id)).toEqual([
        'recent1',
        'recent2',
        'recent3',
      ]);
    });

    it('should keep all messages if none are too old', () => {
      const messages = [
        createMessage('msg1', 'user', 1),
        createMessage('msg2', 'assistant', 2),
        createMessage('msg3', 'user', 12),
      ];

      const cleaned = cleanupOldMessages(messages);

      expect(cleaned).toHaveLength(3);
      expect(cleaned).toEqual(messages);
    });

    it('should handle empty message array', () => {
      const cleaned = cleanupOldMessages([]);
      expect(cleaned).toEqual([]);
    });

    it('should handle messages at the exact cutoff time', () => {
      const cutoffTime =
        Date.now() - CONVERSATION_LIMITS.MAX_MESSAGE_AGE_HOURS * 60 * 60 * 1000;
      const messages = [
        {
          id: 'exact',
          role: 'user' as const,
          content: 'Exact cutoff',
          timestamp: new Date(cutoffTime),
        },
        createMessage('newer', 'assistant', 0),
      ];

      const cleaned = cleanupOldMessages(messages);

      // Message at exact cutoff time should be removed (> comparison)
      expect(cleaned).toHaveLength(1);
    });
  });

  describe('trimMessageHistory', () => {
    it('should keep all messages when under the limit', () => {
      const messages = Array.from({ length: 10 }, (_, i) =>
        createMessage(`msg${i}`, i % 2 === 0 ? 'user' : 'assistant')
      );

      const trimmed = trimMessageHistory(messages);

      expect(trimmed).toHaveLength(10);
      expect(trimmed).toEqual(messages);
    });

    it('should trim to MAX_MESSAGES_IN_MEMORY when over the limit', () => {
      const totalMessages = CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY + 10;
      const messages = Array.from({ length: totalMessages }, (_, i) =>
        createMessage(`msg${i}`, i % 2 === 0 ? 'user' : 'assistant')
      );

      const trimmed = trimMessageHistory(messages);

      expect(trimmed).toHaveLength(CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY);

      // Should keep the most recent messages
      const expectedIds = messages
        .slice(-CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY)
        .map((m) => m.id);
      expect(trimmed.map((m) => m.id)).toEqual(expectedIds);
    });

    it('should handle empty message array', () => {
      const trimmed = trimMessageHistory([]);
      expect(trimmed).toEqual([]);
    });

    it('should handle exactly the maximum number of messages', () => {
      const messages = Array.from(
        { length: CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY },
        (_, i) => createMessage(`msg${i}`, i % 2 === 0 ? 'user' : 'assistant')
      );

      const trimmed = trimMessageHistory(messages);

      expect(trimmed).toHaveLength(CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY);
      expect(trimmed).toEqual(messages);
    });
  });

  describe('getContextMessages', () => {
    it('should return last MAX_MESSAGES_FOR_CONTEXT messages', () => {
      const totalMessages = CONVERSATION_LIMITS.MAX_MESSAGES_FOR_CONTEXT + 5;
      const messages = Array.from({ length: totalMessages }, (_, i) =>
        createMessage(`msg${i}`, i % 2 === 0 ? 'user' : 'assistant')
      );

      const context = getContextMessages(messages);

      expect(context).toHaveLength(
        CONVERSATION_LIMITS.MAX_MESSAGES_FOR_CONTEXT
      );

      // Should be the last N messages
      const expectedIds = messages
        .slice(-CONVERSATION_LIMITS.MAX_MESSAGES_FOR_CONTEXT)
        .map((m) => m.id);
      expect(context.map((m) => m.id)).toEqual(expectedIds);
    });

    it('should return all messages when under the limit', () => {
      const messages = Array.from({ length: 3 }, (_, i) =>
        createMessage(`msg${i}`, i % 2 === 0 ? 'user' : 'assistant')
      );

      const context = getContextMessages(messages);

      expect(context).toHaveLength(3);
      expect(context).toEqual(messages);
    });

    it('should handle empty message array', () => {
      const context = getContextMessages([]);
      expect(context).toEqual([]);
    });

    it('should handle exactly the maximum number of messages', () => {
      const messages = Array.from(
        { length: CONVERSATION_LIMITS.MAX_MESSAGES_FOR_CONTEXT },
        (_, i) => createMessage(`msg${i}`, i % 2 === 0 ? 'user' : 'assistant')
      );

      const context = getContextMessages(messages);

      expect(context).toHaveLength(
        CONVERSATION_LIMITS.MAX_MESSAGES_FOR_CONTEXT
      );
      expect(context).toEqual(messages);
    });
  });

  describe('CONVERSATION_LIMITS constants', () => {
    it('should have reasonable memory management limits', () => {
      expect(CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY).toBe(50);
      expect(CONVERSATION_LIMITS.MAX_MESSAGES_FOR_CONTEXT).toBe(6);
      expect(CONVERSATION_LIMITS.MAX_MESSAGE_AGE_HOURS).toBe(24);
      expect(CONVERSATION_LIMITS.CLEANUP_INTERVAL_MS).toBe(5 * 60 * 1000); // 5 minutes
    });

    it('should have context limit smaller than memory limit', () => {
      expect(CONVERSATION_LIMITS.MAX_MESSAGES_FOR_CONTEXT).toBeLessThan(
        CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY
      );
    });
  });

  describe('Integrated cleanup workflow', () => {
    it('should properly clean and trim in sequence', () => {
      // Create messages: some old, some recent, more than memory limit
      const messages = [
        ...Array.from({ length: 20 }, (_, i) =>
          createMessage(`old${i}`, 'user', 48)
        ), // Old messages
        ...Array.from({ length: 60 }, (_, i) =>
          createMessage(`recent${i}`, 'assistant', 1)
        ), // Recent messages (over limit)
      ];

      // First cleanup old messages
      const cleaned = cleanupOldMessages(messages);
      expect(cleaned).toHaveLength(60); // Only recent messages remain

      // Then trim to memory limit
      const trimmed = trimMessageHistory(cleaned);
      expect(trimmed).toHaveLength(CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY); // Should be trimmed to 50

      // Finally get context messages
      const context = getContextMessages(trimmed);
      expect(context).toHaveLength(
        CONVERSATION_LIMITS.MAX_MESSAGES_FOR_CONTEXT
      );
    });

    it('should handle workflow when no cleanup is needed', () => {
      // Create a small number of recent messages
      const messages = [
        createMessage('msg1', 'user', 1),
        createMessage('msg2', 'assistant', 0),
      ];

      // Cleanup old messages (none should be removed)
      const cleaned = cleanupOldMessages(messages);
      expect(cleaned).toHaveLength(2);

      // Trim (no trimming needed)
      const trimmed = trimMessageHistory(cleaned);
      expect(trimmed).toHaveLength(2);

      // Get context (all messages returned)
      const context = getContextMessages(trimmed);
      expect(context).toHaveLength(2);
    });
  });
});
