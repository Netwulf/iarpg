/**
 * Mock Supabase client for testing
 */
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
  })),
  auth: {
    getUser: jest.fn(() =>
      Promise.resolve({
        data: { user: { id: 'test-user-1', email: 'test@example.com' } },
        error: null,
      })
    ),
    getSession: jest.fn(() =>
      Promise.resolve({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })
    ),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}

export default mockSupabase
