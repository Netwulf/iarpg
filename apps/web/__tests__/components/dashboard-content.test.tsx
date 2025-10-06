import { render, screen, waitFor } from '../utils/test-utils'
import { DashboardContent } from '@/components/dashboard-content'
import { useSession } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock fetchWithAuth
jest.mock('@/lib/fetch-with-auth', () => ({
  fetchWithAuth: jest.fn(),
}))

describe('DashboardContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
  })

  it('displays loading state initially', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    })

    render(<DashboardContent />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('fetches and displays dashboard data when authenticated', async () => {
    const { fetchWithAuth } = require('@/lib/fetch-with-auth')

    // Mock session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          tier: 'free',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    // Mock API responses
    const mockCharacters = [
      { id: 'char-1', name: 'Aragorn' },
      { id: 'char-2', name: 'Legolas' },
    ]

    const mockTables = {
      tables: [
        { id: 'table-1', name: 'Campaign 1', state: 'active' },
        { id: 'table-2', name: 'Campaign 2', state: 'setup' },
        { id: 'table-3', name: 'Campaign 3', state: 'active' },
      ],
    }

    fetchWithAuth
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharacters,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTables,
      })

    render(<DashboardContent />)

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Check if welcome message is displayed
    expect(screen.getByText(/Welcome back, Test User!/i)).toBeInTheDocument()

    // Check if stats are displayed
    await waitFor(() => {
      const characterCounts = screen.getAllByText('2')
      expect(characterCounts.length).toBeGreaterThan(0) // At least one "2" appears
    })
  })

  it('displays error message when fetch fails', async () => {
    const { fetchWithAuth } = require('@/lib/fetch-with-auth')

    // Mock session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
      update: jest.fn(),
    })

    // Mock failed fetch
    fetchWithAuth.mockResolvedValue({
      ok: false,
      status: 500,
    })

    render(<DashboardContent />)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Failed to fetch dashboard data/i)).toBeInTheDocument()
  })
})
