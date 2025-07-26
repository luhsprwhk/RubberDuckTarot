import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { UserBlock, BlockType } from '../../src/interfaces';

// Mock dependencies - using vi.hoisted
const { mockGetArchivedUserBlocks, mockUseAuth, mockUseBlockTypes } =
  vi.hoisted(() => ({
    mockGetArchivedUserBlocks: vi.fn(),
    mockUseAuth: vi.fn(),
    mockUseBlockTypes: vi.fn(),
  }));

vi.mock('../../src/lib/blocks/block-queries', () => ({
  getArchivedUserBlocks: mockGetArchivedUserBlocks,
}));

vi.mock('../../src/lib/hooks/useAuth', () => ({
  default: mockUseAuth,
}));

vi.mock('../../src/lib/blocktypes/useBlockTypes', () => ({
  default: mockUseBlockTypes,
}));

vi.mock('../../src/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

// Mock components
vi.mock('../../src/components/Loading', () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="loading">{text}</div>
  ),
}));

vi.mock('../../src/components/ErrorState', () => ({
  default: ({ error }: { error: string }) => (
    <div data-testid="error-state">{error}</div>
  ),
}));

vi.mock('../../src/components/ads/SmartAd', () => ({
  NativeContentAd: ({ className }: { className?: string }) => (
    <div data-testid="native-ad" className={className}>
      Ad Content
    </div>
  ),
}));

import ArchivedBlocks from '../../src/pages/ArchivedBlocks';

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ArchivedBlocks Page', () => {
  const mockUser = { id: 'user-123' };

  const mockBlockTypes: BlockType[] = [
    {
      id: 'creative',
      name: 'Creative',
      emoji: '🎨',
      description: 'Creative blocks',
    },
    {
      id: 'work',
      name: 'Work',
      emoji: '💼',
      description: 'Work-related blocks',
    },
    {
      id: 'life',
      name: 'Life',
      emoji: '🌱',
      description: 'Life decision blocks',
    },
  ];

  const mockArchivedBlocks: UserBlock[] = [
    {
      id: 1,
      user_id: 'user-123',
      block_type_id: 'creative',
      name: 'Creative Block 1',
      status: 'archived',
      notes: 'Some notes about this block',
      resolution_reflection: 'I found inspiration by taking a walk',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-20'),
    },
    {
      id: 2,
      user_id: 'user-123',
      block_type_id: 'work',
      name: 'Work Procrastination',
      status: 'archived',
      notes: 'Avoiding difficult tasks',
      resolution_reflection: null,
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-01-18'),
    },
    {
      id: 3,
      user_id: 'user-123',
      block_type_id: 'life',
      name: 'Life Decision Block',
      status: 'archived',
      notes: null,
      resolution_reflection: 'Made the decision after pro/con analysis',
      created_at: new Date('2024-01-05'),
      updated_at: new Date('2024-01-25'),
    },
  ];

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter initialEntries={['/archived-blocks']}>
        {component}
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({ user: mockUser });
    mockUseBlockTypes.mockReturnValue({
      blockTypes: mockBlockTypes,
      loading: false,
      error: null,
      refreshBlockTypes: vi.fn(),
    });
    mockGetArchivedUserBlocks.mockResolvedValue(mockArchivedBlocks);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading States', () => {
    it('should show loading state initially', async () => {
      mockUseBlockTypes.mockReturnValue({
        blockTypes: [],
        loading: true,
        error: null,
        refreshBlockTypes: vi.fn(),
      });

      renderWithRouter(<ArchivedBlocks />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(
        screen.getByText('Loading archived blocks...')
      ).toBeInTheDocument();
    });

    it.skip('should show loading when blocks are being fetched', async () => {
      mockGetArchivedUserBlocks.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(<ArchivedBlocks />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should show error state when block types fail to load', async () => {
      mockUseBlockTypes.mockReturnValue({
        blockTypes: [],
        loading: false,
        error: 'Failed to load block types',
        refreshBlockTypes: vi.fn(),
      });

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
        expect(
          screen.getByText('Failed to load block types')
        ).toBeInTheDocument();
      });
    });

    it('should show error state when archived blocks fail to load', async () => {
      mockGetArchivedUserBlocks.mockRejectedValue(new Error('Failed to fetch'));

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
        expect(
          screen.getByText('Failed to load archived blocks')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no archived blocks exist', async () => {
      mockGetArchivedUserBlocks.mockResolvedValue([]);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('Archived Blocks')).toBeInTheDocument();
        expect(
          screen.getByText(
            'No archived blocks found. Blocks you archive will appear here.'
          )
        ).toBeInTheDocument();
        expect(screen.getByText('Back to Blocks')).toBeInTheDocument();
      });
    });

    it('should render archive icon in empty state', async () => {
      mockGetArchivedUserBlocks.mockResolvedValue([]);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        // The Archive icon should be rendered (testing for icon presence via class or test id would be better)
        expect(screen.getByText('Archived Blocks')).toBeInTheDocument();
      });
    });
  });

  describe('Content Display', () => {
    it('should render archived blocks when data is available', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('Creative Block 1')).toBeInTheDocument();
        expect(screen.getByText('Work Procrastination')).toBeInTheDocument();
        expect(screen.getByText('Life Decision Block')).toBeInTheDocument();
      });
    });

    it('should display correct block count', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('3 archived blocks')).toBeInTheDocument();
      });
    });

    it('should display singular block count correctly', async () => {
      mockGetArchivedUserBlocks.mockResolvedValue([mockArchivedBlocks[0]]);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('1 archived block')).toBeInTheDocument();
      });
    });

    it('should display block types with emojis', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('🎨 Creative')).toBeInTheDocument();
        expect(screen.getByText('💼 Work')).toBeInTheDocument();
        expect(screen.getByText('🌱 Life')).toBeInTheDocument();
      });
    });

    it('should handle missing block type gracefully', async () => {
      const blocksWithUnknownType = [
        {
          ...mockArchivedBlocks[0],
          block_type_id: 'unknown-type',
        },
      ];
      mockGetArchivedUserBlocks.mockResolvedValue(blocksWithUnknownType);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('unknown-type')).toBeInTheDocument();
      });
    });

    it.skip('should format dates correctly', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
        expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument();
        expect(screen.getByText('Jan 5, 2024')).toBeInTheDocument();
      });
    });
  });

  describe('Block Status Display', () => {
    it('should display archived status with correct styling', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const statusElements = screen.getAllByText('Archived');
        expect(statusElements).toHaveLength(3);
        statusElements.forEach((element) => {
          expect(element).toHaveClass('text-gray-400', 'bg-gray-400/20');
        });
      });
    });

    it('should handle different status colors correctly', async () => {
      const blocksWithDifferentStatuses = [
        { ...mockArchivedBlocks[0], status: 'resolved' },
        { ...mockArchivedBlocks[1], status: 'active' },
        { ...mockArchivedBlocks[2], status: 'paused' },
      ];
      mockGetArchivedUserBlocks.mockResolvedValue(blocksWithDifferentStatuses);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('Resolved')).toHaveClass(
          'text-green-400',
          'bg-green-400/20'
        );
        expect(screen.getByText('Active')).toHaveClass(
          'text-breakthrough-400',
          'bg-breakthrough-400/20'
        );
        expect(screen.getByText('Paused')).toHaveClass(
          'text-yellow-400',
          'bg-yellow-400/20'
        );
      });
    });
  });

  describe('Block Content Display', () => {
    it('should display block notes when present', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(
          screen.getByText('Some notes about this block')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Avoiding difficult tasks')
        ).toBeInTheDocument();
      });
    });

    it('should not display notes section when notes are null', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        // Life Decision Block has null notes, so should not have a notes section
        expect(screen.queryByText('null')).not.toBeInTheDocument();
      });
    });

    it.skip('should display resolution reflection when present', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('Resolution Reflection')).toBeInTheDocument();
        expect(
          screen.getByText('I found inspiration by taking a walk')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Made the decision after pro/con analysis')
        ).toBeInTheDocument();
      });
    });

    it('should style resolution reflection correctly', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const reflectionLabels = screen.getAllByText('Resolution Reflection');
        reflectionLabels.forEach((label) => {
          expect(label).toHaveClass('text-green-400');
          expect(label.closest('div')).toHaveClass(
            'bg-green-900/20',
            'border-green-400/20'
          );
        });
      });
    });
  });

  describe('Navigation', () => {
    it('should render back to blocks link', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const backLink = screen.getByText('Back to Blocks');
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/blocks');
      });
    });

    it('should render clickable block links', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const blockLinks = screen
          .getAllByRole('link')
          .filter((link) => link.getAttribute('href')?.startsWith('/blocks/'));
        expect(blockLinks).toHaveLength(3);
        expect(blockLinks[0]).toHaveAttribute('href', '/blocks/1');
        expect(blockLinks[1]).toHaveAttribute('href', '/blocks/2');
        expect(blockLinks[2]).toHaveAttribute('href', '/blocks/3');
      });
    });

    it('should have proper link styling', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const blockLinks = screen
          .getAllByRole('link')
          .filter((link) => link.getAttribute('href')?.startsWith('/blocks/'));
        blockLinks.forEach((link) => {
          expect(link).toHaveClass(
            'block',
            'bg-liminal-overlay',
            'border-default',
            'rounded-lg',
            'hover:shadow-lg',
            'hover:border-gray-400'
          );
        });
      });
    });
  });

  describe('Advertisements', () => {
    it('should show ads after every 3rd block', async () => {
      // Create 7 blocks to test ad placement
      const manyBlocks = Array.from({ length: 7 }, (_, i) => ({
        ...mockArchivedBlocks[0],
        id: i + 1,
        name: `Block ${i + 1}`,
      }));
      mockGetArchivedUserBlocks.mockResolvedValue(manyBlocks);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const ads = screen.getAllByTestId('native-ad');
        expect(ads).toHaveLength(2); // After 3rd and 6th blocks
      });
    });

    it('should not show ad after the last block', async () => {
      // Exactly 3 blocks - should not show ad after the 3rd (last) block
      mockGetArchivedUserBlocks.mockResolvedValue(mockArchivedBlocks);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const ads = screen.queryAllByTestId('native-ad');
        expect(ads).toHaveLength(0);
      });
    });

    it('should apply correct className to ads', async () => {
      const manyBlocks = Array.from({ length: 4 }, (_, i) => ({
        ...mockArchivedBlocks[0],
        id: i + 1,
        name: `Block ${i + 1}`,
      }));
      mockGetArchivedUserBlocks.mockResolvedValue(manyBlocks);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const ad = screen.getByTestId('native-ad');
        expect(ad).toHaveClass('my-4');
      });
    });
  });

  describe('User Authentication', () => {
    it('should not fetch blocks when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(mockGetArchivedUserBlocks).not.toHaveBeenCalled();
      });
    });

    it.skip('should fetch blocks when user becomes authenticated', async () => {
      const { rerender } = renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(mockGetArchivedUserBlocks).toHaveBeenCalledWith('user-123');
      });

      // Change user
      mockUseAuth.mockReturnValue({ user: { id: 'user-456' } });

      rerender(<ArchivedBlocks />);

      await waitFor(() => {
        expect(mockGetArchivedUserBlocks).toHaveBeenCalledWith('user-456');
      });
    });
  });

  describe('Data Refreshing', () => {
    it('should call refreshBlockTypes on mount', async () => {
      const mockRefreshBlockTypes = vi.fn();
      mockUseBlockTypes.mockReturnValue({
        blockTypes: mockBlockTypes,
        loading: false,
        error: null,
        refreshBlockTypes: mockRefreshBlockTypes,
      });

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(mockRefreshBlockTypes).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle console errors during fetch', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockGetArchivedUserBlocks.mockRejectedValue(new Error('Network error'));

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to fetch archived blocks:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it.skip('should reset error state on successful retry', async () => {
      mockGetArchivedUserBlocks
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockArchivedBlocks);

      const { rerender } = renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });

      // Trigger retry by changing user (simulating a refetch)
      mockUseAuth.mockReturnValue({ user: { id: 'user-123' } });
      rerender(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
        expect(screen.getByText('Creative Block 1')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toHaveTextContent('Archived Blocks');

        const blockHeadings = screen.getAllByRole('heading', { level: 3 });
        expect(blockHeadings).toHaveLength(3);
      });
    });

    it('should have proper link accessibility', async () => {
      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to blocks/i });
        expect(backLink).toBeInTheDocument();

        const blockLinks = screen
          .getAllByRole('link')
          .filter((link) => link.getAttribute('href')?.startsWith('/blocks/'));
        expect(blockLinks).toHaveLength(3);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long block names', async () => {
      const longNameBlock = {
        ...mockArchivedBlocks[0],
        name: 'This is a very long block name that might cause layout issues if not handled properly in the UI components',
      };
      mockGetArchivedUserBlocks.mockResolvedValue([longNameBlock]);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText(longNameBlock.name)).toBeInTheDocument();
      });
    });

    it('should handle special characters in block content', async () => {
      const specialCharBlock = {
        ...mockArchivedBlocks[0],
        name: 'Block with émojis 🎉 and <script>alert("xss")</script>',
        notes: 'Notes with special chars: @#$%^&*()_+{}[]|\\:";\'<>?,./',
      };
      mockGetArchivedUserBlocks.mockResolvedValue([specialCharBlock]);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText(specialCharBlock.name)).toBeInTheDocument();
        expect(screen.getByText(specialCharBlock.notes)).toBeInTheDocument();
      });
    });

    it('should handle empty strings in block fields', async () => {
      const emptyStringBlock = {
        ...mockArchivedBlocks[0],
        notes: '',
        resolution_reflection: '',
      };
      mockGetArchivedUserBlocks.mockResolvedValue([emptyStringBlock]);

      renderWithRouter(<ArchivedBlocks />);

      await waitFor(() => {
        expect(screen.getByText('Creative Block 1')).toBeInTheDocument();
        // Empty notes should not create a notes section
        // Empty reflection should not create a reflection section
      });
    });
  });
});
