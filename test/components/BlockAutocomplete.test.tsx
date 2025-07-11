import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockAutocomplete } from '@/src/components/BlockAutocomplete';
import type { UserBlock } from '@/supabase/schema';

// Mock dependencies
vi.mock('@/src/lib/blocks/useUserBlocks', () => ({
  useUserBlocks: vi.fn(),
}));

vi.mock('@/src/lib/hooks/useAuth', () => ({
  default: vi.fn(),
}));

vi.mock('@/src/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('BlockAutocomplete', () => {
  let mockBlocks: UserBlock[];
  let mockOnBlockSelect: ReturnType<typeof vi.fn>;
  let mockUseUserBlocks: ReturnType<typeof vi.fn>;
  let mockUseAuth: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockBlocks = [
      {
        id: 1,
        user_id: 'user-123',
        block_type_id: 'creative',
        name: 'Creative Block',
        status: 'active',
        notes: 'Struggling with new ideas',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        user_id: 'user-123',
        block_type_id: 'work',
        name: 'Work Procrastination',
        status: 'active',
        notes: 'Delaying important tasks',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        user_id: 'user-123',
        block_type_id: 'life',
        name: 'Life Decision',
        status: 'active',
        notes: 'Cannot decide on major life change',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockOnBlockSelect = vi.fn();

    mockUseUserBlocks = vi.fn().mockReturnValue({
      blocks: mockBlocks,
      loading: false,
      fetchUserBlocks: vi.fn(),
    });

    mockUseAuth = vi.fn().mockReturnValue({
      user: { id: 'user-123' },
    });

    const { useUserBlocks } = await import('@/src/lib/blocks/useUserBlocks');
    const useAuth = await import('@/src/lib/hooks/useAuth');

    vi.mocked(useUserBlocks).mockImplementation(mockUseUserBlocks);
    vi.mocked(useAuth.default).mockImplementation(mockUseAuth);
  });

  it('should filter blocks correctly', async () => {
    render(
      <BlockAutocomplete
        selectedBlock={null}
        onBlockSelect={mockOnBlockSelect}
        placeholder="Search blocks..."
      />
    );

    const input = screen.getByPlaceholderText('Search blocks...');

    // Type "creative" to filter
    fireEvent.change(input, { target: { value: 'creative' } });

    await waitFor(() => {
      expect(screen.getByText('Creative Block')).toBeInTheDocument();
      expect(
        screen.queryByText('Work Procrastination')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Life Decision')).not.toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    mockUseUserBlocks.mockReturnValue({
      blocks: [],
      loading: true,
      fetchUserBlocks: vi.fn(),
    });

    const { useUserBlocks } = await import('@/src/lib/blocks/useUserBlocks');
    vi.mocked(useUserBlocks).mockImplementation(mockUseUserBlocks);

    render(
      <BlockAutocomplete
        selectedBlock={null}
        onBlockSelect={mockOnBlockSelect}
      />
    );

    // Should show loading spinner
    const loadingSpinner =
      screen.getByTestId('loading-spinner') ||
      document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should display selected block correctly', async () => {
    const selectedBlock = mockBlocks[0];

    render(
      <BlockAutocomplete
        selectedBlock={selectedBlock}
        onBlockSelect={mockOnBlockSelect}
      />
    );

    const input = screen.getByDisplayValue('Creative Block');
    expect(input).toBeInTheDocument();
  });

  it('should call onBlockSelect when block is selected', async () => {
    render(
      <BlockAutocomplete
        selectedBlock={null}
        onBlockSelect={mockOnBlockSelect}
      />
    );

    const input = screen.getByPlaceholderText('Search or select a block...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Creative' } });

    await waitFor(() => {
      expect(screen.getByText('Creative Block')).toBeInTheDocument();
    });

    const option = screen.getByText('Creative Block');
    fireEvent.mouseDown(option);
    fireEvent.click(option);

    expect(mockOnBlockSelect).toHaveBeenCalledWith(mockBlocks[0]);
  });

  it('should show no blocks found message when search yields no results', async () => {
    render(
      <BlockAutocomplete
        selectedBlock={null}
        onBlockSelect={mockOnBlockSelect}
      />
    );

    const input = screen.getByPlaceholderText('Search or select a block...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No blocks found.')).toBeInTheDocument();
    });
  });

  it('should handle empty blocks array', async () => {
    mockUseUserBlocks.mockReturnValue({
      blocks: [],
      loading: false,
      fetchUserBlocks: vi.fn(),
    });

    const { useUserBlocks } = await import('@/src/lib/blocks/useUserBlocks');
    vi.mocked(useUserBlocks).mockImplementation(mockUseUserBlocks);

    render(
      <BlockAutocomplete
        selectedBlock={null}
        onBlockSelect={mockOnBlockSelect}
      />
    );

    const input = screen.getByPlaceholderText('Search or select a block...');
    fireEvent.click(input);

    // Should not show any options but also not crash
    await waitFor(() => {
      expect(screen.queryByText('Creative Block')).not.toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <BlockAutocomplete
        selectedBlock={null}
        onBlockSelect={mockOnBlockSelect}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should fetch user blocks on mount', async () => {
    const mockFetchUserBlocks = vi.fn();
    mockUseUserBlocks.mockReturnValue({
      blocks: mockBlocks,
      loading: false,
      fetchUserBlocks: mockFetchUserBlocks,
    });

    const { useUserBlocks } = await import('@/src/lib/blocks/useUserBlocks');
    vi.mocked(useUserBlocks).mockImplementation(mockUseUserBlocks);

    render(
      <BlockAutocomplete
        selectedBlock={null}
        onBlockSelect={mockOnBlockSelect}
      />
    );

    expect(mockFetchUserBlocks).toHaveBeenCalledWith('user-123');
  });

  it('should handle case-insensitive filtering', async () => {
    render(
      <BlockAutocomplete
        selectedBlock={null}
        onBlockSelect={mockOnBlockSelect}
      />
    );

    const input = screen.getByPlaceholderText('Search or select a block...');

    // Type "CREATIVE" in uppercase
    fireEvent.change(input, { target: { value: 'CREATIVE' } });

    await waitFor(() => {
      expect(screen.getByText('Creative Block')).toBeInTheDocument();
    });

    // Type "creative" in lowercase
    fireEvent.change(input, { target: { value: 'creative' } });

    await waitFor(() => {
      expect(screen.getByText('Creative Block')).toBeInTheDocument();
    });
  });

  it('should show selected indicator for selected block', async () => {
    const selectedBlock = mockBlocks[0];

    render(
      <BlockAutocomplete
        selectedBlock={selectedBlock}
        onBlockSelect={mockOnBlockSelect}
      />
    );

    const input = screen.getByDisplayValue('Creative Block');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Creative' } });

    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });
});
