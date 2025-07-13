import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../src/components/Dashboard';
import useAuth from '../../src/lib/hooks/useAuth';
import { useUserBlocks } from '../../src/lib/blocks/useUserBlocks';
import { getDb } from '../../src/lib/database-provider';
import {
  getUserProfile,
  isProfileComplete,
} from '../../src/lib/userPreferences';

// Mock dependencies
vi.mock('../../src/lib/hooks/useAuth');
vi.mock('../../src/lib/blocks/useUserBlocks');
vi.mock('../../src/lib/database-provider');
vi.mock('../../src/lib/userPreferences');
vi.mock('../../src/components/Loading', () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="loading">{text}</div>
  ),
}));
vi.mock('../../src/components/NewInsightForm', () => ({
  default: () => <div data-testid="new-insight-form">New Insight Form</div>,
}));
vi.mock('../../src/components/BlockTracker', () => ({
  default: () => <div data-testid="block-tracker">Block Tracker</div>,
}));
vi.mock('../../src/components/ads/SmartAd', () => ({
  DashboardAd: () => <div data-testid="dashboard-ad">Dashboard Ad</div>,
  NativeContentAd: () => (
    <div data-testid="native-content-ad">Native Content Ad</div>
  ),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseUserBlocks = vi.mocked(useUserBlocks);
const mockGetDb = vi.mocked(getDb);
const mockGetUserProfile = vi.mocked(getUserProfile);
const mockIsProfileComplete = vi.mocked(isProfileComplete);

const mockUser = {
  id: 'test-user-id',
  created_at: new Date(),
  preferences: null,
  email: 'test@example.com',
  premium: false,
  auth_uid: 'test-auth-uid',
  notion_access_token: null,
  notion_workspace_id: null,
};

const mockProfile = {
  id: 1,
  user_id: 'test-user-id',
  name: 'Test User',
  birthday: '1990-01-01',
  birth_place: 'Test City',
  creative_identity: 'Developer',
  work_context: 'Tech',
  zodiac_sign: 'Aquarius',
  debugging_mode: 'Logical',
  block_pattern: 'Procrastination',
  superpower: 'Focus',
  kryptonite: 'Distractions',
  spirit_animal: 'Owl',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockBlockTypes = [
  { id: '1', name: 'Focus', emoji: '🎯', description: 'Focus block' },
  { id: '2', name: 'Creativity', emoji: '🎨', description: 'Creativity block' },
];

import type { DatabaseAdapter } from '../../src/lib/database-adapter';
import type { Mocked } from 'vitest';

const mockDb: Mocked<DatabaseAdapter> = {
  // Cards
  getAllCards: vi.fn().mockResolvedValue([]),
  getCardById: vi.fn().mockResolvedValue(null),

  // Block Types
  getAllBlockTypes: vi.fn().mockResolvedValue(mockBlockTypes),
  getBlockTypeById: vi.fn().mockResolvedValue(null),

  // Readings
  createReading: vi.fn().mockResolvedValue({} as never),
  getUserReadings: vi.fn().mockResolvedValue([]),
  getReadingById: vi.fn().mockResolvedValue(null),

  // Sentiment tracking
  updateInsightSentiment: vi.fn().mockResolvedValue(undefined),
};

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard timeout handling (simplified)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful mocks
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signUpForWaitlist: vi.fn(),
      signUpWithMagicLink: vi.fn(),
      signInWithMagicLink: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      refreshUser: vi.fn(),
      isAuthModalOpen: false,
      authModalMode: 'signIn',
      showAuthModal: vi.fn(),
      hideAuthModal: vi.fn(),
      setAuthModalMode: vi.fn(),
    });

    mockUseUserBlocks.mockReturnValue({
      blocks: [],
      loading: false,
      error: null,
      fetchUserBlocks: vi.fn(),
      refreshBlocks: vi.fn(),
    });

    mockGetDb.mockResolvedValue(mockDb);
    mockGetUserProfile.mockResolvedValue(mockProfile);
    mockIsProfileComplete.mockReturnValue(true);
  });

  it('should handle successful data loading without timeout', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderDashboard();

    // Should eventually show the new insight form
    await waitFor(
      () => {
        expect(screen.getByTestId('new-insight-form')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should not have any timeout errors
    expect(consoleSpy).not.toHaveBeenCalledWith(
      'Error fetching user data:',
      expect.objectContaining({
        message: expect.stringContaining('timeout'),
      })
    );

    consoleSpy.mockRestore();
  });

  it('should handle database errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const dbError = new Error('Database connection failed');
    mockGetDb.mockRejectedValue(dbError);

    renderDashboard();

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching user data:',
          dbError
        );
      },
      { timeout: 3000 }
    );

    // Should still render fallback state
    await waitFor(
      () => {
        expect(screen.getByTestId('new-insight-form')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    consoleSpy.mockRestore();
  });

  it('should handle getUserProfile errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const profileError = new Error('Profile fetch failed');
    mockGetUserProfile.mockRejectedValue(profileError);

    renderDashboard();

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching user data:',
          profileError
        );
      },
      { timeout: 3000 }
    );

    // Should still render fallback state
    await waitFor(
      () => {
        expect(screen.getByTestId('new-insight-form')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    consoleSpy.mockRestore();
  });

  it('should handle blockTypes loading errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const blockTypesError = new Error('Block types fetch failed');
    mockDb.getAllBlockTypes.mockRejectedValue(blockTypesError);

    renderDashboard();

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching user data:',
          blockTypesError
        );
      },
      { timeout: 3000 }
    );

    // Should still render fallback state
    await waitFor(
      () => {
        expect(screen.getByTestId('new-insight-form')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    consoleSpy.mockRestore();
  });

  it('should call clearTimeout when operations complete successfully', async () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    renderDashboard();

    await waitFor(
      () => {
        expect(screen.getByTestId('new-insight-form')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should have called clearTimeout to clean up the timeout
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('should set loading to false after any operation (success or failure)', async () => {
    const profileError = new Error('Profile fetch failed');
    mockGetUserProfile.mockRejectedValue(profileError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderDashboard();

    // Should start with loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Should eventually stop loading and show content
    await waitFor(
      () => {
        expect(screen.getByTestId('new-insight-form')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Loading indicator should be gone
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
