/**
 * Mock Supabase Admin for API testing
 */
export const mockSupabaseAdmin = {
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
    admin: {
      getUserById: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-1', email: 'test@example.com' } },
          error: null,
        })
      ),
      updateUserById: jest.fn(() =>
        Promise.resolve({ data: {}, error: null })
      ),
    },
  },
}

jest.mock('@iarpg/db', () => ({
  createSupabaseAdmin: jest.fn(() => mockSupabaseAdmin),
}))

export default mockSupabaseAdmin
