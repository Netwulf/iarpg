import request from 'supertest'
import express from 'express'
import { supabase } from '@iarpg/db'

// Mock Supabase before importing routes
jest.mock('@iarpg/db', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock authentication middleware
jest.mock('@/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-1', email: 'test@example.com' }
    next()
  },
}))

// Mock Socket.io
jest.mock('@/socket', () => ({
  getIO: jest.fn(() => ({
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  })),
}))

// Import router AFTER mocks
import tablesRouter from '@/routes/tables.routes'
import { errorMiddleware } from '@/middleware/error.middleware'

// Create Express app for testing
const app = express()
app.use(express.json())
app.use('/api/tables', tablesRouter)
app.use(errorMiddleware)

describe('Tables Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/tables', () => {
    it('creates table with valid data and generates invite code', async () => {
      const validTable = {
        name: 'Epic Adventure',
        description: 'A thrilling campaign',
        playStyle: 'sync',
        privacy: 'private',
        maxPlayers: 4,
        tags: ['fantasy', 'beginner'],
      }

      const mockTableData = {
        id: 'table-123',
        owner_id: 'test-user-1',
        ...validTable,
        invite_code: 'ABC123', // Generated code
        state: 'setup',
        rules_variant: 'standard',
      }

      // Mock Supabase chain for invite code uniqueness check
      const mockCodeCheckSingle = jest.fn().mockResolvedValue({ data: null, error: null }) // Code doesn't exist (is unique)
      const mockCodeCheckEq = jest.fn().mockReturnValue({ single: mockCodeCheckSingle })
      const mockCodeCheckSelect = jest.fn().mockReturnValue({ eq: mockCodeCheckEq })

      // Mock Supabase chain for table creation
      const mockInsertSingle = jest.fn().mockResolvedValue({ data: mockTableData, error: null })
      const mockInsertSelect = jest.fn().mockReturnValue({ single: mockInsertSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect })

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockCodeCheckSelect }) // First call: check invite code
        .mockReturnValueOnce({ insert: mockInsert }) // Second call: create table

      const response = await request(app)
        .post('/api/tables')
        .send(validTable)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('invite_code')
      expect(response.body.invite_code).toHaveLength(6)
      expect(supabase.from).toHaveBeenCalledWith('tables')
    })

    it('rejects invalid play style with 400 error', async () => {
      const invalidTable = {
        name: 'Test Table',
        playStyle: 'invalid-style', // Invalid
        privacy: 'private',
      }

      const response = await request(app)
        .post('/api/tables')
        .send(invalidTable)

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('sync, async, or solo')
    })

    it('rejects invalid privacy setting with 400 error', async () => {
      const invalidTable = {
        name: 'Test Table',
        playStyle: 'sync',
        privacy: 'invalid-privacy', // Invalid
      }

      const response = await request(app)
        .post('/api/tables')
        .send(invalidTable)

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('private, public, or spectator')
    })

    it('rejects name shorter than 3 characters with 400 error', async () => {
      const invalidTable = {
        name: 'AB', // Too short
        playStyle: 'sync',
        privacy: 'private',
      }

      const response = await request(app)
        .post('/api/tables')
        .send(invalidTable)

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('between 3 and 50')
    })
  })

  describe('GET /api/tables/by-code/:code', () => {
    it('returns table when valid invite code is provided', async () => {
      const mockTable = {
        id: 'table-123',
        name: 'Adventure Time',
        invite_code: 'ABC123',
        owner: {
          id: 'owner-1',
          username: 'DM_Master',
        },
        members: [],
      }

      // Mock Supabase chain
      const mockSingle = jest.fn().mockResolvedValue({ data: mockTable, error: null })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const response = await request(app).get('/api/tables/by-code/ABC123')

      expect(response.status).toBe(200)
      expect(response.body.table).toHaveProperty('id')
      expect(response.body.table.invite_code).toBe('ABC123')
      expect(mockEq).toHaveBeenCalledWith('invite_code', 'ABC123')
    })

    it('returns 400 for invalid invite code format', async () => {
      const response = await request(app).get('/api/tables/by-code/ABC') // Too short

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('Invalid invite code')
    })

    it('returns 404 when invite code not found', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Supabase not found
      })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const response = await request(app).get('/api/tables/by-code/ZZZZZZ')

      expect(response.status).toBe(404)
      expect(response.body.error.message).toContain('not found')
    })
  })

  describe('POST /api/tables/:id/join', () => {
    it('allows user to join table with valid character', async () => {
      const tableId = 'table-123'
      const characterId = 'char-456'

      // Mock table fetch (has space)
      const mockTableData = {
        id: tableId,
        max_players: 4,
        members: [{ count: 2 }], // 2 current members
      }
      const mockTableSingle = jest.fn().mockResolvedValue({ data: mockTableData, error: null })
      const mockTableEq = jest.fn().mockReturnValue({ single: mockTableSingle })
      const mockTableSelect = jest.fn().mockReturnValue({ eq: mockTableEq })

      // Mock existing member check (not a member yet)
      const mockMemberSingle = jest.fn().mockResolvedValue({ data: null, error: null })
      const mockMemberEq1 = jest.fn().mockReturnValue({ single: mockMemberSingle })
      const mockMemberEq2 = jest.fn().mockReturnValue({ eq: mockMemberEq1 })
      const mockMemberSelect = jest.fn().mockReturnValue({ eq: mockMemberEq2 })

      // Mock character ownership verification
      const mockCharacterData = {
        id: characterId,
        user_id: 'test-user-1', // Owned by current user
      }
      const mockCharSingle = jest.fn().mockResolvedValue({ data: mockCharacterData, error: null })
      const mockCharEq = jest.fn().mockReturnValue({ single: mockCharSingle })
      const mockCharSelect = jest.fn().mockReturnValue({ eq: mockCharEq })

      // Mock member creation
      const mockNewMember = {
        id: 'member-789',
        table_id: tableId,
        user_id: 'test-user-1',
        character_id: characterId,
        role: 'player',
        status: 'active',
      }
      const mockCreateSingle = jest.fn().mockResolvedValue({ data: mockNewMember, error: null })
      const mockCreateSelect = jest.fn().mockReturnValue({ single: mockCreateSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockCreateSelect })

      // Mock table update (last_activity_at)
      const mockUpdateEq = jest.fn().mockResolvedValue({ error: null })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq })

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockTableSelect }) // Table fetch
        .mockReturnValueOnce({ select: mockMemberSelect }) // Member check
        .mockReturnValueOnce({ select: mockCharSelect }) // Character check
        .mockReturnValueOnce({ insert: mockInsert }) // Member creation
        .mockReturnValueOnce({ update: mockUpdate }) // Table update

      const response = await request(app)
        .post(`/api/tables/${tableId}/join`)
        .send({ characterId })

      expect(response.status).toBe(200)
      expect(response.body.message).toContain('Successfully joined')
      expect(response.body.member).toHaveProperty('id')
    })

    it('returns 400 when table is full', async () => {
      const tableId = 'table-123'
      const characterId = 'char-456'

      // Mock table fetch (full)
      const mockTableData = {
        id: tableId,
        max_players: 4,
        members: [{ count: 4 }], // Already full
      }
      const mockSingle = jest.fn().mockResolvedValue({ data: mockTableData, error: null })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const response = await request(app)
        .post(`/api/tables/${tableId}/join`)
        .send({ characterId })

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('Table is full')
    })

    it('returns 400 when character ID is missing', async () => {
      const tableId = 'table-123'

      const response = await request(app)
        .post(`/api/tables/${tableId}/join`)
        .send({}) // Missing characterId

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('Character ID is required')
    })
  })

  describe('POST /api/tables/:id/messages', () => {
    it('creates message with valid content', async () => {
      const tableId = 'table-123'
      const messageContent = 'The dragon roars fiercely!'

      const mockMessage = {
        id: 'msg-789',
        table_id: tableId,
        user_id: 'test-user-1',
        content: messageContent,
        type: 'ic',
        user: {
          id: 'test-user-1',
          username: 'TestPlayer',
        },
      }

      const mockSingle = jest.fn().mockResolvedValue({ data: mockMessage, error: null })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      ;(supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert })

      const response = await request(app)
        .post(`/api/tables/${tableId}/messages`)
        .send({ content: messageContent, type: 'ic' })

      expect(response.status).toBe(201)
      expect(response.body.message).toHaveProperty('id')
      expect(response.body.message.content).toBe(messageContent)
    })

    it('rejects empty message with 400 error', async () => {
      const tableId = 'table-123'

      const response = await request(app)
        .post(`/api/tables/${tableId}/messages`)
        .send({ content: '   ' }) // Whitespace only

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('content is required')
    })

    it('rejects message longer than 1000 characters with 400 error', async () => {
      const tableId = 'table-123'
      const longMessage = 'A'.repeat(1001)

      const response = await request(app)
        .post(`/api/tables/${tableId}/messages`)
        .send({ content: longMessage })

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('too long')
    })

    it('rejects invalid message type with 400 error', async () => {
      const tableId = 'table-123'

      const response = await request(app)
        .post(`/api/tables/${tableId}/messages`)
        .send({ content: 'Test', type: 'invalid-type' })

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('Invalid message type')
    })
  })
})
