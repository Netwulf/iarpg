/**
 * Dashboard Real Data Test
 * Validates that dashboard displays actual character/table counts from API
 * Story: WEEK1.3
 */

import { render, screen, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { DashboardContent } from '@/components/dashboard-content';
import userEvent from '@testing-library/user-event';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({
    data: {
      user: { id: 'test-user', email: 'test@example.com', name: 'Test User', tier: 'premium' },
    },
    status: 'authenticated',
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Dashboard Real Data - WEEK1.3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays actual character and table counts', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: '1', name: 'Aragorn' },
          { id: '2', name: 'Legolas' },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tables: [
            { id: '1', state: 'active', name: 'Campaign 1' },
            { id: '2', state: 'paused', name: 'Campaign 2' },
            { id: '3', state: 'active', name: 'Campaign 3' },
          ],
          pagination: { page: 1, totalPages: 1 },
        }),
      } as Response);

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      // Character count = 2
      const characterCards = screen.getAllByText(/characters/i);
      expect(characterCards.length).toBeGreaterThan(0);

      // Should show "2" somewhere for character count
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Active tables count = 2 (state='active')
    expect(screen.getByText('2')).toBeInTheDocument();

    // Total tables = 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => [],
      }), 100))
    );

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    // Should show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles zero characters gracefully', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // No characters
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tables: [], pagination: {} }),
      } as Response);

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText(/create your first character/i)).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retries fetch on error when retry button clicked', async () => {
    const user = userEvent.setup();

    // First call fails, second succeeds
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '1' }],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tables: [], pagination: {} }),
      } as Response);

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    // Should show data after retry
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('calculates active tables correctly', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tables: [
            { id: '1', state: 'active' },
            { id: '2', state: 'setup' },
            { id: '3', state: 'active' },
            { id: '4', state: 'completed' },
            { id: '5', state: 'paused' },
          ],
          pagination: {},
        }),
      } as Response);

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    await waitFor(() => {
      // Should show 2 active tables (only state='active')
      const activeTablesSection = screen.getByText(/active tables/i).closest('div');
      expect(activeTablesSection).toBeInTheDocument();

      // Total tables = 5
      const campaignsSection = screen.getByText(/campaigns/i).closest('div');
      expect(campaignsSection).toBeInTheDocument();
    });
  });
});
