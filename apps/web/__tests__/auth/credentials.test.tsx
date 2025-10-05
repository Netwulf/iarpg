/**
 * Auth Credentials Test
 * Validates that all API calls include credentials: 'include' for session cookies
 * Story: WEEK1.1
 */

import { render, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { DashboardContent } from '@/components/dashboard-content';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({
    data: {
      user: { id: 'test-user', email: 'test@example.com', name: 'Test User' },
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

describe('Auth Credentials - WEEK1.1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('includes credentials in character API fetch', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/characters'),
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  it('includes credentials in tables API fetch', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], pagination: {} }),
    } as Response);

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/tables'),
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  it('makes parallel API calls with credentials', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '1' }],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tables: [{ id: '1' }], pagination: {} }),
      } as Response);

    render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      // Both calls should have credentials
      expect(fetchSpy.mock.calls[0][1]).toHaveProperty('credentials', 'include');
      expect(fetchSpy.mock.calls[1][1]).toHaveProperty('credentials', 'include');
    });
  });

  it('handles 401 errors gracefully', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response);

    const { container } = render(
      <SessionProvider>
        <DashboardContent />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
      // Should not crash, should show error state
      expect(container.textContent).not.toContain('Loading');
    });
  });
});
