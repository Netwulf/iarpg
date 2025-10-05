/**
 * Table Browser API Test
 * Validates that table browser fetches and displays tables from real API
 * Story: WEEK1.5
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TableBrowserClient } from '@/app/tables/browse/table-browser-client';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Table Browser API - WEEK1.5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';
  });

  it('fetches and displays tables from API on mount', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tables: [
          {
            id: '1',
            name: 'Dragon Quest',
            description: 'Epic adventure',
            playStyle: 'async',
            privacy: 'public',
            playerCount: 4,
            maxPlayers: 6,
            tags: ['dragons', 'epic'],
            lastActivityAt: '2025-10-04T12:00:00Z',
            inviteCode: 'DRAGON123',
          },
        ],
        pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
      }),
    } as Response);

    render(<TableBrowserClient />);

    await waitFor(() => {
      expect(screen.getByText('Dragon Quest')).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tables'),
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  it('includes search filter in API query', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], pagination: { page: 1, totalPages: 1 } }),
    } as Response);

    render(<TableBrowserClient />);

    const searchInput = screen.getByPlaceholderText(/search tables/i);
    fireEvent.change(searchInput, { target: { value: 'dragon' } });

    // Wait for debounce (300ms)
    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=dragon'),
          expect.anything()
        );
      },
      { timeout: 500 }
    );
  });

  it('includes play style filters in API query', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], pagination: {} }),
    } as Response);

    render(<TableBrowserClient />);

    // Check "async" checkbox
    const asyncCheckbox = screen.getByLabelText(/async/i);
    fireEvent.click(asyncCheckbox);

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('playStyles=async'),
          expect.anything()
        );
      },
      { timeout: 500 }
    );
  });

  it('handles multiple play style filters', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], pagination: {} }),
    } as Response);

    render(<TableBrowserClient />);

    // Check both "async" and "sync"
    const asyncCheckbox = screen.getByLabelText(/async/i);
    const syncCheckbox = screen.getByLabelText(/sync/i);

    fireEvent.click(asyncCheckbox);
    fireEvent.click(syncCheckbox);

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('playStyles=async,sync'),
          expect.anything()
        );
      },
      { timeout: 500 }
    );
  });

  it('displays pagination controls', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tables: Array(12).fill({ id: '1', name: 'Table', playStyle: 'sync' }),
        pagination: { page: 1, totalPages: 3, total: 36, limit: 12 },
      }),
    } as Response);

    render(<TableBrowserClient />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });
  });

  it('navigates to next page on pagination click', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tables: [],
        pagination: { page: 1, totalPages: 3 },
      }),
    } as Response);

    render(<TableBrowserClient />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.anything()
      );
    });
  });

  it('clears all filters when clear button clicked', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], pagination: {} }),
    } as Response);

    render(<TableBrowserClient />);

    // Apply filters
    const searchInput = screen.getByPlaceholderText(/search tables/i);
    fireEvent.change(searchInput, { target: { value: 'dragon' } });

    const asyncCheckbox = screen.getByLabelText(/async/i);
    fireEvent.click(asyncCheckbox);

    await waitFor(() => {
      expect(screen.getByText(/Clear Filters \(2\)/i)).toBeInTheDocument();
    });

    // Click clear
    const clearButton = screen.getByText(/Clear Filters/i);
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(asyncCheckbox).not.toBeChecked();
    });
  });

  it('shows empty state when no tables found', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], pagination: { page: 1, totalPages: 0 } }),
    } as Response);

    render(<TableBrowserClient />);

    await waitFor(() => {
      expect(screen.getByText(/No Tables Found/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ tables: [], pagination: {} }),
              }),
            100
          )
        )
    );

    render(<TableBrowserClient />);

    expect(screen.getByText(/Loading tables/i)).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<TableBrowserClient />);

    await waitFor(() => {
      // Should not crash, should handle error silently or show message
      expect(screen.queryByText('Dragon Quest')).not.toBeInTheDocument();
    });
  });

  it('resets to page 1 when filters change', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], pagination: { page: 2, totalPages: 3 } }),
    } as Response);

    render(<TableBrowserClient />);

    // Go to page 2
    await waitFor(() => {
      expect(screen.getByText(/Page 2/i)).toBeInTheDocument();
    });

    // Change search filter
    const searchInput = screen.getByPlaceholderText(/search tables/i);
    fireEvent.change(searchInput, { target: { value: 'new search' } });

    await waitFor(
      () => {
        // Should reset to page 1
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.anything()
        );
      },
      { timeout: 500 }
    );
  });
});
