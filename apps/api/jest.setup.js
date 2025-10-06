// Mock Supabase
jest.mock('@iarpg/db', () => ({
  createSupabaseAdmin: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
    auth: {
      admin: {
        getUserById: jest.fn(),
        updateUserById: jest.fn(),
      },
    },
  })),
}))

// Mock environment variables
process.env.SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.JWT_SECRET = 'test-jwt-secret'
