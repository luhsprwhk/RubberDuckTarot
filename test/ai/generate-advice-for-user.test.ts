/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import generateAdviceForUser from '@/src/ai/generate_advice_for_user';
import type { User } from '@/src/interfaces';
import type { UserProfile, UserBlock } from '@/supabase/schema';
import type { Card } from '@/supabase/schema';

// Mock dependencies
vi.mock('@/src/lib/userPreferences', () => ({
  getUserProfile: vi.fn(),
}));

vi.mock('@/src/lib/blocks/block-queries', () => ({
  getUserBlocks: vi.fn(),
}));

vi.mock('@/src/lib/insights/insight-queries', () => ({
  getInsightsByBlockType: vi.fn(),
}));

vi.mock('@/src/lib/reflections/reflection-queries', () => ({
  getReflectionsByUserAndCard: vi.fn(),
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
  default: 'Mock system prompt',
}));

describe('generateAdviceForUser', () => {
  let mockUser: User;
  let mockCard: Card;
  let mockUserProfile: UserProfile;
  let mockUserBlocks: UserBlock[];
  let mockInsights: any[];
  let mockReflections: any[];

  beforeEach(async () => {
    vi.clearAllMocks();

    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      created_at: new Date(),
      preferences: {},
      badges: [],
      premium: false,
      auth_uid: 'auth-123',
      notion_access_token: null,
      notion_workspace_id: null,
    };

    mockCard = {
      id: 1,
      name: 'Test Card',
      emoji: '🎯',
      traditional_equivalent: 'The Fool',
      core_meaning: 'New beginnings and taking risks',
      duck_question: 'Are you ready to leap?',
      perspective_prompts: ["What would you do if you knew you couldn't fail?"],
      block_applications: {
        creative: 'Try something new creatively',
        work: 'Take on a challenging project',
        life: 'Make a bold life change',
        relationship: 'Open up to someone new',
      },
      duck_wisdom:
        'Sometimes the best path forward is the one that scares you most.',
      reversed_meaning: 'Hesitation and missed opportunities',
      tags: ['beginnings', 'courage', 'risk'],
    };

    mockUserProfile = {
      id: 1,
      user_id: 'user-123',
      name: 'Test User',
      birthday: '1990-01-01',
      birth_place: 'Springfield',
      creative_identity: 'Developer',
      work_context: 'Tech Startup',
      debugging_mode: 'Step-by-step',
      block_pattern: 'Perfectionism',
      superpower: 'Problem solving',
      kryptonite: 'Imposter syndrome',
      zodiac_sign: 'Gemini',
      spirit_animal: 'Owl',
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockUserBlocks = [
      {
        id: 1,
        user_id: 'user-123',
        block_type_id: 'creative',
        name: 'Creative Block',
        status: 'active',
        notes: 'Struggling with new project ideas',
        resolution_reflection: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockInsights = [];
    mockReflections = [];

    // Setup default mocks
    const { getUserProfile } = await import('@/src/lib/userPreferences');
    const { getUserBlocks } = await import('@/src/lib/blocks/block-queries');
    const { getInsightsByBlockType } = await import(
      '@/src/lib/insights/insight-queries'
    );
    const { getReflectionsByUserAndCard } = await import(
      '@/src/lib/reflections/reflection-queries'
    );

    vi.mocked(getUserProfile).mockResolvedValue(mockUserProfile);
    vi.mocked(getUserBlocks).mockResolvedValue(mockUserBlocks);
    vi.mocked(getInsightsByBlockType).mockResolvedValue(mockInsights);
    vi.mocked(getReflectionsByUserAndCard).mockResolvedValue(mockReflections);
  });

  it('should generate advice with proper fallback', async () => {
    const { anthropic } = await import('@/src/ai/index');

    // Mock successful API response
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Test advice from AI', citations: [] }],
      id: 'msg-123',
      model: 'claude-3-sonnet-20240229',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: {
        input_tokens: 100,
        output_tokens: 20,
        cache_creation_input_tokens: null,
        cache_read_input_tokens: null,
        server_tool_use: null,
        service_tier: null,
      },
    });

    const result = await generateAdviceForUser(mockCard, 'creative', mockUser);

    expect(result).toBe('Test advice from AI');
    expect(anthropic.messages.create).toHaveBeenCalledWith({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: 'Mock system prompt',
      messages: [
        {
          role: 'user',
          content: expect.stringContaining('Test User'),
        },
      ],
    });
  });

  it('should handle API errors gracefully', async () => {
    const { anthropic } = await import('@/src/ai/index');

    // Mock API error
    vi.mocked(anthropic.messages.create).mockRejectedValue(
      new Error('API Error')
    );

    const result = await generateAdviceForUser(mockCard, 'creative', mockUser);

    // Should fall back to card's generic advice
    expect(result).toBe('Try something new creatively');
  });

  it('should respect token limits', async () => {
    const { anthropic } = await import('@/src/ai/index');

    // Mock successful API response
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Brief advice', citations: [] }],
      id: 'msg-123',
      model: 'claude-3-sonnet-20240229',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: {
        input_tokens: 100,
        output_tokens: 20,
        cache_creation_input_tokens: null,
        cache_read_input_tokens: null,
        server_tool_use: null,
        service_tier: null,
      },
    });

    await generateAdviceForUser(mockCard, 'creative', mockUser);

    expect(anthropic.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        max_tokens: 200,
      })
    );
  });

  it('should handle missing user profile gracefully', async () => {
    const { getUserProfile } = await import('@/src/lib/userPreferences');
    const { anthropic } = await import('@/src/ai/index');

    // Mock missing user profile
    vi.mocked(getUserProfile).mockResolvedValue(null);

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'text', text: 'Generic advice', citations: [] }],
      id: 'msg-123',
      model: 'claude-3-sonnet-20240229',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: {
        input_tokens: 100,
        output_tokens: 20,
        cache_creation_input_tokens: null,
        cache_read_input_tokens: null,
        server_tool_use: null,
        service_tier: null,
      },
    });

    const result = await generateAdviceForUser(mockCard, 'creative', mockUser);

    expect(result).toBe('Generic advice');
    expect(anthropic.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'user',
            content: expect.stringContaining('Unknown'), // Should use 'Unknown' for missing profile data
          },
        ],
      })
    );
  });

  it('should handle non-text API responses', async () => {
    const { anthropic } = await import('@/src/ai/index');

    // Mock non-text response
    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [{ type: 'image' as any, text: undefined } as any],
      id: 'msg-123',
      model: 'claude-3-sonnet-20240229',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: {
        input_tokens: 100,
        output_tokens: 20,
        cache_creation_input_tokens: null,
        cache_read_input_tokens: null,
        server_tool_use: null,
        service_tier: null,
      },
    });

    const result = await generateAdviceForUser(mockCard, 'creative', mockUser);

    // Should fall back to card's generic advice
    expect(result).toBe('Try something new creatively');
  });

  it('should incorporate user reflections and insights', async () => {
    const { getInsightsByBlockType } = await import(
      '@/src/lib/insights/insight-queries'
    );
    const { getReflectionsByUserAndCard } = await import(
      '@/src/lib/reflections/reflection-queries'
    );
    const { anthropic } = await import('@/src/ai/index');

    // Mock insights with this card
    const mockInsightsWithCard = [
      {
        id: 1,
        user_id: 'user-123',
        spread_type: 'quick-draw',
        block_type_id: 'creative',
        user_block_id: 1,
        user_context: 'Stuck on new project',
        cards_drawn: [{ id: 1, reversed: false }],
        reading: {
          summary: 'Test reading',
          interpretation: 'Test interpretation',
          keyInsights: ['Test insight'],
          actionSteps: ['Test action'],
          robQuip: 'Test quip',
        },
        resonated: true,
        took_action: false,
        created_at: new Date(),
      },
    ];

    const mockReflectionsWithCard = [
      {
        id: 1,
        user_id: 'user-123',
        card_id: 1,
        prompt_index: 0,
        reflection_text: 'This card makes me think about taking risks',
        block_type_id: 'creative',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.mocked(getInsightsByBlockType).mockResolvedValue(mockInsightsWithCard);
    vi.mocked(getReflectionsByUserAndCard).mockResolvedValue(
      mockReflectionsWithCard
    );

    vi.mocked(anthropic.messages.create).mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'Personalized advice based on history',
          citations: [],
        },
      ],
      id: 'msg-123',
      model: 'claude-3-sonnet-20240229',
      role: 'assistant',
      stop_reason: 'end_turn',
      stop_sequence: null,
      type: 'message',
      usage: {
        input_tokens: 100,
        output_tokens: 20,
        cache_creation_input_tokens: null,
        cache_read_input_tokens: null,
        server_tool_use: null,
        service_tier: null,
      },
    });

    const result = await generateAdviceForUser(mockCard, 'creative', mockUser);

    expect(result).toBe('Personalized advice based on history');
    expect(anthropic.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'user',
            content: expect.stringContaining(
              'This card makes me think about taking risks'
            ),
          },
        ],
      })
    );
  });
});
