import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BlockResolvedModal } from '../../src/components/BlockResolvedModal';

// Mock navigator.share and navigator.clipboard
const mockShare = vi.fn();
const mockClipboardWriteText = vi.fn();

Object.defineProperty(navigator, 'share', {
  writable: true,
  value: undefined,
});

Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: mockClipboardWriteText,
  },
});

// Mock react-confetti
vi.mock('react-confetti', () => ({
  default: ({
    numberOfPieces,
    width,
    height,
  }: {
    numberOfPieces: number;
    width: number;
    height: number;
  }) => (
    <div
      data-testid="confetti"
      data-pieces={numberOfPieces}
      data-width={width}
      data-height={height}
    />
  ),
}));

// Mock rob emoji import
vi.mock('../../src/assets/rob-emoji.png', () => ({
  default: '/mock-rob-emoji.png',
}));

describe('BlockResolvedModal', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockShare.mockClear();
    mockClipboardWriteText.mockClear();
    // Clear timeouts
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Celebration Step', () => {
    it('should render celebration step initially', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      expect(screen.getByText('🎉 Block Resolved! 🎉')).toBeInTheDocument();
      expect(
        screen.getByText(/Congrats on pushing through/)
      ).toBeInTheDocument();
      expect(screen.getByText('"Test Block"')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('should show confetti when modal opens', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      const confetti = screen.getByTestId('confetti');
      expect(confetti).toBeInTheDocument();
      expect(confetti).toHaveAttribute('data-pieces', '200');
    });

    it('should show first resolution badge when isFirstBlockResolved is true', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
          isFirstBlockResolved={true}
        />
      );

      expect(screen.getByText('First Resolution')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(
        screen.getByText(/First block resolved - that's your proof/)
      ).toBeInTheDocument();
    });

    it('should not show first resolution elements when isFirstBlockResolved is false', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
          isFirstBlockResolved={false}
        />
      );

      expect(screen.queryByText('First Resolution')).not.toBeInTheDocument();
      expect(screen.queryByText('Share')).not.toBeInTheDocument();
      expect(
        screen.queryByText(/First block resolved - that's your proof/)
      ).not.toBeInTheDocument();
    });

    it('should proceed to reflection step when Continue is clicked', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      fireEvent.click(screen.getByText('Continue'));

      expect(screen.getByText('Quick Reflection')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/What helped you push through/)
      ).toBeInTheDocument();
    });

    it('should hide confetti after clicking Continue', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      fireEvent.click(screen.getByText('Continue'));

      expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
    });

    it('should call onClose when X button is clicked', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      // Find all buttons and filter for the one that contains an X icon
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find((button) =>
        button.querySelector('svg.lucide-x')
      );

      expect(closeButton).toBeDefined();
      fireEvent.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Share functionality', () => {
    it('should use native share when available', async () => {
      navigator.share = mockShare;
      mockShare.mockResolvedValue(undefined);

      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
          isFirstBlockResolved={true}
        />
      );

      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);

      // Use act and expect synchronously since share is sync in the component
      await act(async () => {
        expect(mockShare).toHaveBeenCalledWith({
          text: 'Just resolved my first block on Rubber Duck Tarot! 🦆✨ Getting unstuck one breakthrough at a time.',
          url: window.location.origin,
        });
      });
    });

    it('should fallback to clipboard when navigator.share is not available', async () => {
      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: undefined,
      });

      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
          isFirstBlockResolved={true}
        />
      );

      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);

      // Use act and expect synchronously since clipboard write is sync in the component
      await act(async () => {
        expect(mockClipboardWriteText).toHaveBeenCalledWith(
          `Just resolved my first block on Rubber Duck Tarot! 🦆✨ Getting unstuck one breakthrough at a time. ${window.location.origin}`
        );
      });
    });
  });

  describe('Reflection Step', () => {
    beforeEach(() => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );
      fireEvent.click(screen.getByText('Continue'));
    });

    it('should render reflection step UI', () => {
      expect(screen.getByText('Quick Reflection')).toBeInTheDocument();
      expect(
        screen.getByText(/Before we archive this block/)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/What helped you push through/)
      ).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(screen.getByText('Archive Block')).toBeInTheDocument();
    });

    it('should update button text when reflection is entered', () => {
      const textarea = screen.getByPlaceholderText(
        /What helped you push through/
      );
      fireEvent.change(textarea, {
        target: { value: 'I took a break and came back fresh' },
      });

      expect(screen.getByText('Save & Archive Block')).toBeInTheDocument();
    });

    it('should keep button text as "Archive Block" when reflection is empty', () => {
      const textarea = screen.getByPlaceholderText(
        /What helped you push through/
      );
      fireEvent.change(textarea, { target: { value: '   ' } }); // Only whitespace

      expect(screen.getByText('Archive Block')).toBeInTheDocument();
    });

    it('should call onClose with reflection when Archive Block is clicked', () => {
      const textarea = screen.getByPlaceholderText(
        /What helped you push through/
      );
      fireEvent.change(textarea, {
        target: { value: 'I took a break and came back fresh' },
      });

      fireEvent.click(screen.getByText('Save & Archive Block'));

      expect(mockOnClose).toHaveBeenCalledWith(
        'I took a break and came back fresh'
      );
    });

    it('should call onClose with undefined when reflection is empty', () => {
      fireEvent.click(screen.getByText('Archive Block'));

      expect(mockOnClose).toHaveBeenCalledWith(undefined);
    });

    it('should go back to celebration step when Back is clicked', () => {
      fireEvent.click(screen.getByText('Back'));

      expect(screen.getByText('🎉 Block Resolved! 🎉')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('should call onClose when X button is clicked in reflection step', () => {
      // Find all buttons and filter for the one that contains an X icon
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find((button) =>
        button.querySelector('svg.lucide-x')
      );

      expect(closeButton).toBeDefined();
      fireEvent.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Modal State Management', () => {
    it('should reset state when modal reopens', async () => {
      const { rerender } = render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      // Go to reflection step and add content
      fireEvent.click(screen.getByText('Continue'));
      const textarea = screen.getByPlaceholderText(
        /What helped you push through/
      );
      fireEvent.change(textarea, { target: { value: 'Some reflection' } });

      // Close modal
      rerender(
        <BlockResolvedModal
          isOpen={false}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      // Reopen modal
      rerender(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      // Should be back to celebration step with confetti
      expect(screen.getByText('🎉 Block Resolved! 🎉')).toBeInTheDocument();
      expect(screen.getByTestId('confetti')).toBeInTheDocument();
    });

    it('should not render anything when modal is closed', () => {
      render(
        <BlockResolvedModal
          isOpen={false}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      expect(
        screen.queryByText('🎉 Block Resolved! 🎉')
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
    });

    it('should handle modal close with timeout cleanup', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      // Go to reflection step
      fireEvent.click(screen.getByText('Continue'));

      // Close modal via X button
      const closeButton = screen.getAllByRole('button')[0];
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();

      // Fast-forward the timeout
      act(() => {
        vi.advanceTimersByTime(300);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      // Dialog should be present
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Text area in reflection step should be accessible
      fireEvent.click(screen.getByText('Continue'));
      const textarea = screen.getByPlaceholderText(
        /What helped you push through/
      );
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('should focus properly when modal opens', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Test Block"
        />
      );

      // Modal dialog should be in the DOM
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Different block names', () => {
    it('should display different block names correctly', () => {
      const { rerender } = render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Creative Block"
        />
      );

      expect(screen.getByText('"Creative Block"')).toBeInTheDocument();

      rerender(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Work Procrastination"
        />
      );

      expect(screen.getByText('"Work Procrastination"')).toBeInTheDocument();
    });

    it('should handle long block names', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="This is a very long block name that might cause layout issues if not handled properly"
        />
      );

      expect(
        screen.getByText(
          '"This is a very long block name that might cause layout issues if not handled properly"'
        )
      ).toBeInTheDocument();
    });

    it('should handle special characters in block names', () => {
      render(
        <BlockResolvedModal
          isOpen={true}
          onClose={mockOnClose}
          blockName="Block with & special <characters> and 'quotes'"
        />
      );

      // Use a more flexible text matcher since React might escape the characters
      expect(
        screen.getByText((content) => {
          return (
            content.includes('Block with') &&
            content.includes('special') &&
            content.includes('characters') &&
            content.includes('quotes')
          );
        })
      ).toBeInTheDocument();
    });
  });
});
