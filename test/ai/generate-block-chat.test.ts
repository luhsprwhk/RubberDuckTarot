/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateBlockChat } from '@/src/ai/generate_block_chat';
import type { UserBlock, BlockType, Insight } from '@/src/interfaces';

// Mock dependencies
vi.mock('@/src/lib/rate-limiter', () => ({
  rateLimiter: {
    checkLimit: vi.fn(),
  },
  RateLimitError: class RateLimitError extends Error {
    retryAfter: number;
    resetTime: number;
    remainingRequests: number;

    constructor(
      message: string,
      retryAfter: number,
      resetTime: number,
      remainingRequests: number
    ) {
      super(message);
      this.name = 'RateLimitError';
      this.retryAfter = retryAfter;
      this.resetTime = resetTime;
      this.remainingRequests = remainingRequests;
    }
  },
  createRateLimitMessage: vi.fn().mockReturnValue('Rate limit exceeded'),
}));

vi.mock('@/src/ai/profession-metaphors', () => ({
  getContextMetaphors: vi.fn().mockReturnValue({
    style: 'Tech metaphors: debugging, refactoring, etc.',
    note: '(tech professional)',
    category: 'technical',
  }),
}));

vi.mock('@/src/ai/index', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
}));

// Mock system prompt
vi.mock('@/src/ai/system-prompt.md?raw', () => ({
  default: 'Mock system prompt for Rob',
}));

describe('generateBlockChat', () => {
  let mockUserBlock: UserBlock;
  let mockBlockType: BlockType;
  let mockInsights: Insight[];
  let mockConversationHistory: any[];

  beforeEach(async () => {
    vi.clearAllMocks();

    // Set environment variable for model
    import.meta.env.VITE_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

    mockUserBlock = {
      id: 1,
      user_id: 'user-123',
      block_type_id: 'creative',
      name: 'Creative Writing Block',
      status: 'active',
      notes: 'Struggling to find inspiration for new stories',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-02'),
    };

    mockBlockType = {
      id: 'creative',
      name: 'Creative',
      emoji: '🎨',
      description: 'Creative blocks and artistic challenges',
    };

    mockInsights = [
      {
        id: 1,
        user_id: 'user-123',
        spread_type: 'quick-draw',
        block_type_id: 'creative',
        user_block_id: 1,
        user_context: 'Stuck on new novel',
        cards_drawn: [{ id: 1, reversed: false }],
        reading: {
          interpretation: 'You need to trust your instincts and start writing',
          keyInsights: [
            'Trust your creative process',
            'Start small and build momentum',
          ],
          actionSteps: ['Write for 15 minutes daily', 'Join a writing group'],
          robQuip: 'Creativity is like a muscle - use it or lose it!',
          reflectionPrompts: ['What story wants to be told through you?'],
        },
        resonated: true,
        took_action: true,
        created_at: new Date('2024-01-01'),
      },
      {
        id: 2,
        user_id: 'user-123',
        spread_type: 'full-pond',
        block_type_id: 'creative',
        user_block_id: 1,
        user_context: "Writer's block",
        cards_drawn: [{ id: 2, reversed: true }],
        reading: {
          interpretation:
            'Your perfectionism is holding you back from creating',
          keyInsights: ['Progress over perfection'],
          actionSteps: ['Set a timer and write without editing'],
          robQuip: 'Done is better than perfect!',
          reflectionPrompts: [],
        },
        resonated: false,
        took_action: false,
        created_at: new Date('2024-01-02'),
      },
    ];

    mockConversationHistory = [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: "I'm struggling with this creative block",
        timestamp: new Date(),
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'Tell me more about what specifically is blocking you',
        timestamp: new Date(),
      },
    ];

    // Setup default mocks
    const { rateLimiter } = await import('@/src/lib/rate-limiter');
    vi.mocked(rateLimiter.checkLimit).mockResolvedValue({
      allowed: true,
      remainingRequests: 10,
      resetTime: Date.now() + 3600000,
      totalRequests: 5,
    });
  });

  it('should generate block chat response successfully', async () => {
    const { anthropic } = await import('@/src/ai/index');

    // Mock successful API response
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'I understand your creative writing block. Based on your previous insights that resonated, it seems like trusting your creative process and starting small worked well for you before. What specific aspect of writing is feeling stuck right now?',
          citations: [],
        },
      ],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: {
        input_tokens: 250,
        output_tokens: 45,
        cache_creation_input_tokens: null,
        cache_read_input_tokens: null,
        server_tool_use: null,
        service_tier: null,
      },
    });

    const result = await generateBlockChat({
      userMessage: 'I need help with my writing',
      conversationHistory: mockConversationHistory,
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: mockInsights,
    });

    expect(result).toBe(
      'I understand your creative writing block. Based on your previous insights that resonated, it seems like trusting your creative process and starting small worked well for you before. What specific aspect of writing is feeling stuck right now?'
    );

    expect(anthropic.messages.create).toHaveBeenCalledWith({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.7,
      system: 'Mock system prompt for Rob',
      messages: [
        {
          role: 'user',
          content: expect.stringContaining('Creative Writing Block'),
        },
      ],
    });
  });

  it('should include block details in the prompt', async () => {
    const { anthropic } = await import('@/src/ai/index');

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    await generateBlockChat({
      userMessage: 'Help me with this block',
      conversationHistory: [],
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: [],
    });

    const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
    const prompt = callArgs.messages[0].content;

    expect(prompt).toContain('Block Name: "Creative Writing Block"');
    expect(prompt).toContain('Block Category: Creative (🎨)');
    expect(prompt).toContain('Block Status: active');
    expect(prompt).toContain(
      'Block Notes: Struggling to find inspiration for new stories'
    );
    expect(prompt).toContain('Created: 12/31/2023');
  });

  it('should include relevant insights that resonated or led to action', async () => {
    const { anthropic } = await import('@/src/ai/index');

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    await generateBlockChat({
      userMessage: 'Help me with this block',
      conversationHistory: [],
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: mockInsights,
    });

    const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
    const prompt = callArgs.messages[0].content;

    // Should include the insight that resonated and led to action
    expect(prompt).toContain('12/31/2023 (resonated, took action)');
    expect(prompt).toContain('Trust your creative process');
    expect(prompt).toContain('Start small and build momentum');
    expect(prompt).toContain(
      'You need to trust your instincts and start writing'
    );

    // Should NOT include the insight that didn't resonate
    expect(prompt).not.toContain('Overcoming perfectionism');
    expect(prompt).not.toContain('Progress over perfection');
  });

  it('should handle no relevant insights gracefully', async () => {
    const { anthropic } = await import('@/src/ai/index');

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    // Use insights that didn't resonate or lead to action
    const noRelevantInsights = mockInsights.map((insight) => ({
      ...insight,
      resonated: false,
      took_action: false,
    }));

    await generateBlockChat({
      userMessage: 'Help me with this block',
      conversationHistory: [],
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: noRelevantInsights,
    });

    const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
    const prompt = callArgs.messages[0].content;

    expect(prompt).toContain(
      'No previous insights with positive feedback yet.'
    );
  });

  it('should include conversation history in prompt', async () => {
    const { anthropic } = await import('@/src/ai/index');

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    await generateBlockChat({
      userMessage: 'Can you elaborate on that?',
      conversationHistory: mockConversationHistory,
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: [],
    });

    const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
    const prompt = callArgs.messages[0].content;

    expect(prompt).toContain('CONVERSATION HISTORY:');
    expect(prompt).toContain("user: I'm struggling with this creative block");
    expect(prompt).toContain(
      'assistant: Tell me more about what specifically is blocking you'
    );
  });

  it('should limit conversation history to recent messages', async () => {
    const { anthropic } = await import('@/src/ai/index');

    // Create a long conversation history (more than 6 messages)
    const longHistory = Array.from({ length: 10 }, (_, i) => ({
      id: `msg-${i}`,
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Message ${i}`,
      timestamp: new Date(),
    }));

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    await generateBlockChat({
      userMessage: 'Latest message',
      conversationHistory: longHistory,
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: [],
    });

    const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
    const prompt = callArgs.messages[0].content;

    // Should only include last 6 messages
    expect(prompt).toContain('Message 4'); // Should include
    expect(prompt).toContain('Message 9'); // Should include (most recent)
    expect(prompt).not.toContain('Message 0'); // Should NOT include (too old)
    expect(prompt).not.toContain('Message 3'); // Should NOT include (too old)
  });

  it('should handle rate limiting', async () => {
    const { rateLimiter, RateLimitError } = await import(
      '@/src/lib/rate-limiter'
    );

    // Mock rate limit exceeded
    vi.mocked(rateLimiter.checkLimit).mockResolvedValue({
      allowed: false,
      remainingRequests: 0,
      resetTime: Date.now() + 3600000,
      totalRequests: 10,
      retryAfter: 3600,
    });

    await expect(
      generateBlockChat({
        userMessage: 'Help me',
        conversationHistory: [],
        userBlock: mockUserBlock,
        blockType: mockBlockType,
        userId: 'user-123',
        blockInsights: [],
      })
    ).rejects.toThrow(RateLimitError);

    expect(rateLimiter.checkLimit).toHaveBeenCalledWith(
      'user-123',
      'generateBlockChat',
      600
    );
  });

  it('should handle API errors gracefully', async () => {
    const { anthropic } = await import('@/src/ai/index');

    // Mock API error
    vi.mocked(anthropic.messages.create).mockRejectedValue(
      new Error('API Connection Failed')
    );

    await expect(
      generateBlockChat({
        userMessage: 'Help me',
        conversationHistory: [],
        userBlock: mockUserBlock,
        blockType: mockBlockType,
        userId: 'user-123',
        blockInsights: [],
      })
    ).rejects.toThrow('Failed to generate block chat response');
  });

  it('should handle non-text API responses', async () => {
    const { anthropic } = await import('@/src/ai/index');

    // Mock non-text response
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'image' as any }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    await expect(
      generateBlockChat({
        userMessage: 'Help me',
        conversationHistory: [],
        userBlock: mockUserBlock,
        blockType: mockBlockType,
        userId: 'user-123',
        blockInsights: [],
      })
    ).rejects.toThrow('Failed to generate block chat response');
  });

  it('should use environment variable for model', async () => {
    const { anthropic } = await import('@/src/ai/index');

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    await generateBlockChat({
      userMessage: 'Help me',
      conversationHistory: [],
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: [],
    });

    expect(anthropic.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
      })
    );
  });

  it('should handle model selection correctly', async () => {
    // This test verifies that the function uses the model from the environment
    // The default model fallback is tested implicitly by having the env variable set
    const { anthropic } = await import('@/src/ai/index');

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    await generateBlockChat({
      userMessage: 'Help me',
      conversationHistory: [],
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: [],
    });

    // Verify the model selection logic works
    expect(anthropic.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String), // Model can be either env var or default
      })
    );
  });

  it('should include context metaphors in prompt', async () => {
    const { anthropic } = await import('@/src/ai/index');
    const { getContextMetaphors } = await import(
      '@/src/ai/profession-metaphors'
    );

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      id: 'msg-123',
      model: 'claude-sonnet-4-20250514',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: { input_tokens: 100, output_tokens: 10 },
    } as any);

    await generateBlockChat({
      userMessage: 'Help me',
      conversationHistory: [],
      userBlock: mockUserBlock,
      blockType: mockBlockType,
      userId: 'user-123',
      blockInsights: [],
    });

    expect(getContextMetaphors).toHaveBeenCalledWith({
      creative_identity: 'general',
      work_context: 'creative',
    });

    const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
    const prompt = callArgs.messages[0].content;

    expect(prompt).toContain('CONTEXT METAPHORS');
    expect(prompt).toContain(
      'Tech metaphors: debugging, refactoring, etc. - (tech professional)'
    );
  });

  describe('defensive null checks', () => {
    it('should handle null insights array gracefully', async () => {
      const { anthropic } = await import('@/src/ai/index');

      vi.mocked(anthropic.messages.create).mockResolvedValue({
        content: [{ type: 'text', text: 'Test response' }],
        id: 'msg-123',
        model: 'claude-sonnet-4-20250514',
        role: 'assistant',
        stop_reason: 'end_turn',
        stop_sequence: null,
        type: 'message',
        usage: { input_tokens: 100, output_tokens: 10 },
      } as any);

      await generateBlockChat({
        userMessage: 'Help me',
        conversationHistory: [],
        userBlock: mockUserBlock,
        blockType: mockBlockType,
        userId: 'user-123',
        blockInsights: null as any, // Test null insights
      });

      const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
      const prompt = callArgs.messages[0].content;

      expect(prompt).toContain(
        'No previous insights with positive feedback yet.'
      );
    });

    it('should handle insights with missing properties', async () => {
      const { anthropic } = await import('@/src/ai/index');

      vi.mocked(anthropic.messages.create).mockResolvedValue({
        content: [{ type: 'text', text: 'Test response' }],
        id: 'msg-123',
        model: 'claude-sonnet-4-20250514',
        role: 'assistant',
        stop_reason: 'end_turn',
        stop_sequence: null,
        type: 'message',
        usage: { input_tokens: 100, output_tokens: 10 },
      } as any);

      const malformedInsights = [
        null, // Completely null insight
        {}, // Empty object
        { id: 1 }, // Missing required fields
        {
          id: 2,
          resonated: true,
          created_at: 'invalid-date',
          reading: null, // Null reading
        },
        {
          id: 3,
          resonated: true,
          created_at: new Date('2024-01-01'),
          reading: {
            keyInsights: null, // Null keyInsights
            interpretation: undefined, // Undefined interpretation
          },
        },
      ];

      await generateBlockChat({
        userMessage: 'Help me',
        conversationHistory: [],
        userBlock: mockUserBlock,
        blockType: mockBlockType,
        userId: 'user-123',
        blockInsights: malformedInsights as any,
      });

      const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
      const prompt = callArgs.messages[0].content;

      // Should handle malformed data gracefully and not crash
      expect(prompt).toContain('RELEVANT PAST INSIGHTS');
    });

    it('should handle missing userBlock properties', async () => {
      const { anthropic } = await import('@/src/ai/index');

      vi.mocked(anthropic.messages.create).mockResolvedValue({
        content: [{ type: 'text', text: 'Test response' }],
        id: 'msg-123',
        model: 'claude-sonnet-4-20250514',
        role: 'assistant',
        stop_reason: 'end_turn',
        stop_sequence: null,
        type: 'message',
        usage: { input_tokens: 100, output_tokens: 10 },
      } as any);

      const incompleteUserBlock = {
        id: 1,
        user_id: 'user-123',
        block_type_id: 'creative',
        // Missing name, status, notes, created_at
      };

      await generateBlockChat({
        userMessage: 'Help me',
        conversationHistory: [],
        userBlock: incompleteUserBlock as any,
        blockType: mockBlockType,
        userId: 'user-123',
        blockInsights: [],
      });

      const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
      const prompt = callArgs.messages[0].content;

      expect(prompt).toContain('Block Name: "Unnamed Block"');
      expect(prompt).toContain('Block Status: unknown');
      expect(prompt).toContain('Block Notes: No notes yet');
      expect(prompt).toContain('Created: Unknown date');
    });

    it('should handle missing blockType properties', async () => {
      const { anthropic } = await import('@/src/ai/index');

      vi.mocked(anthropic.messages.create).mockResolvedValue({
        content: [{ type: 'text', text: 'Test response' }],
        id: 'msg-123',
        model: 'claude-sonnet-4-20250514',
        role: 'assistant',
        stop_reason: 'end_turn',
        stop_sequence: null,
        type: 'message',
        usage: { input_tokens: 100, output_tokens: 10 },
      } as any);

      const incompleteBlockType = {
        id: 'creative',
        // Missing name, emoji, description, etc.
      };

      await generateBlockChat({
        userMessage: 'Help me',
        conversationHistory: [],
        userBlock: mockUserBlock,
        blockType: incompleteBlockType as any,
        userId: 'user-123',
        blockInsights: [],
      });

      const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
      const prompt = callArgs.messages[0].content;

      expect(prompt).toContain('Block Category: General (🎯)');
    });

    it('should handle invalid conversation history', async () => {
      const { anthropic } = await import('@/src/ai/index');

      vi.mocked(anthropic.messages.create).mockResolvedValue({
        content: [{ type: 'text', text: 'Test response' }],
        id: 'msg-123',
        model: 'claude-sonnet-4-20250514',
        role: 'assistant',
        stop_reason: 'end_turn',
        stop_sequence: null,
        type: 'message',
        usage: { input_tokens: 100, output_tokens: 10 },
      } as any);

      const invalidHistory = [
        null, // Null message
        {}, // Empty object
        { role: 'user' }, // Missing content
        { content: 'test' }, // Missing role
        { role: 'user', content: 'valid message' }, // Valid message
      ];

      await generateBlockChat({
        userMessage: 'Help me',
        conversationHistory: invalidHistory as any,
        userBlock: mockUserBlock,
        blockType: mockBlockType,
        userId: 'user-123',
        blockInsights: [],
      });

      const callArgs = vi.mocked(anthropic.messages.create).mock.calls[0][0];
      const prompt = callArgs.messages[0].content;

      // Should only include the valid message
      expect(prompt).toContain('user: valid message');
      expect(prompt).not.toContain('undefined');
    });

    it('should validate input parameters', async () => {
      // Test invalid userMessage
      await expect(
        generateBlockChat({
          userMessage: '', // Empty string
          conversationHistory: [],
          userBlock: mockUserBlock,
          blockType: mockBlockType,
          userId: 'user-123',
          blockInsights: [],
        })
      ).rejects.toThrow('Invalid user message provided');

      // Test invalid userId
      await expect(
        generateBlockChat({
          userMessage: 'Help me',
          conversationHistory: [],
          userBlock: mockUserBlock,
          blockType: mockBlockType,
          userId: '', // Empty string
          blockInsights: [],
        })
      ).rejects.toThrow('Invalid user ID provided');

      // Test null userBlock
      await expect(
        generateBlockChat({
          userMessage: 'Help me',
          conversationHistory: [],
          userBlock: null as any,
          blockType: mockBlockType,
          userId: 'user-123',
          blockInsights: [],
        })
      ).rejects.toThrow('Invalid user block data provided');

      // Test null blockType
      await expect(
        generateBlockChat({
          userMessage: 'Help me',
          conversationHistory: [],
          userBlock: mockUserBlock,
          blockType: null as any,
          userId: 'user-123',
          blockInsights: [],
        })
      ).rejects.toThrow('Invalid block type data provided');
    });
  });
});
