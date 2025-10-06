import request from 'supertest'
import express from 'express'
import { supabase } from '@iarpg/db'

// Mock Supabase before importing routes
jest.mock('@iarpg/db', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

// Mock authentication middleware before importing routes
jest.mock('@/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-1', email: 'test@example.com' }
    next()
  },
}))

// Import router AFTER mocks
import charactersRouter from '@/routes/characters.routes'
import { errorMiddleware } from '@/middleware/error.middleware'

// Create Express app for testing
const app = express()
app.use(express.json())
app.use('/api/characters', charactersRouter)
// Add error middleware
app.use(errorMiddleware)

describe('Characters Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/characters', () => {
    it('creates character with valid data and calculates derived stats', async () => {
      const validCharacter = {
        name: 'Aragorn',
        race: 'Human',
        class: 'Ranger',
        level: 1,
        abilityScores: {
          strength: 16,
          dexterity: 14,
          constitution: 14,
          intelligence: 10,
          wisdom: 12,
          charisma: 8,
        },
      }

      const mockCharacterData = {
        id: 'char-123',
        user_id: 'test-user-1',
        ...validCharacter,
        hp: 12, // 10 (Ranger hit die) + 2 (CON modifier)
        max_hp: 12,
        ac: 12, // 10 + 2 (DEX modifier)
        initiative: 2, // DEX modifier
        speed: 30, // Human speed
        proficiency_bonus: 2,
      }

      // Mock Supabase chain
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({ data: mockCharacterData, error: null })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect, single: mockSingle })
      ;(supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert })

      const response = await request(app)
        .post('/api/characters')
        .send(validCharacter)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.hp).toBe(12)
      expect(response.body.ac).toBe(12)
      expect(supabase.from).toHaveBeenCalledWith('characters')
    })

    it('rejects invalid data with 400 error', async () => {
      const invalidCharacter = {
        name: 'Invalid',
        // Missing race and class
      }

      const response = await request(app)
        .post('/api/characters')
        .send(invalidCharacter)

      expect(response.status).toBe(400)
      expect(response.body.error).toHaveProperty('message')
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('rejects missing ability scores with 400 error', async () => {
      const invalidCharacter = {
        name: 'Test',
        race: 'Elf',
        class: 'Wizard',
        // Missing abilityScores
      }

      const response = await request(app)
        .post('/api/characters')
        .send(invalidCharacter)

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('ability scores')
    })
  })

  describe('GET /api/characters', () => {
    it('returns only characters owned by authenticated user', async () => {
      const mockCharacters = [
        { id: 'char-1', name: 'Aragorn', user_id: 'test-user-1' },
        { id: 'char-2', name: 'Legolas', user_id: 'test-user-1' },
      ]

      // Mock Supabase chain
      const mockOrder = jest.fn().mockResolvedValue({ data: mockCharacters, error: null })
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const response = await request(app).get('/api/characters')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-1')
    })
  })

  describe('PATCH /api/characters/:id', () => {
    it('updates character when user is owner', async () => {
      const existingCharacter = {
        id: 'char-123',
        name: 'Aragorn',
        user_id: 'test-user-1',
        hp: 10,
      }

      const updatedCharacter = {
        ...existingCharacter,
        hp: 8,
      }

      // Mock fetch to verify ownership
      const mockSingleFetch = jest.fn().mockResolvedValue({ data: existingCharacter, error: null })
      const mockEqFetch = jest.fn().mockReturnValue({ single: mockSingleFetch })
      const mockSelectFetch = jest.fn().mockReturnValue({ eq: mockEqFetch })

      // Mock update operation
      const mockSingleUpdate = jest.fn().mockResolvedValue({ data: updatedCharacter, error: null })
      const mockSelectUpdate = jest.fn().mockReturnValue({ single: mockSingleUpdate })
      const mockEqUpdate = jest.fn().mockReturnValue({ select: mockSelectUpdate })
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEqUpdate })

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelectFetch }) // First call for verification
        .mockReturnValueOnce({ update: mockUpdate }) // Second call for update

      const response = await request(app)
        .patch('/api/characters/char-123')
        .send({ hp: 8 })

      expect(response.status).toBe(200)
      expect(response.body.hp).toBe(8)
    })

    it('returns 403 when user is not owner', async () => {
      const otherUserCharacter = {
        id: 'char-123',
        name: 'Gandalf',
        user_id: 'other-user', // Different user
      }

      const mockSingle = jest.fn().mockResolvedValue({ data: otherUserCharacter, error: null })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const response = await request(app)
        .patch('/api/characters/char-123')
        .send({ hp: 5 })

      expect(response.status).toBe(403)
      expect(response.body.error.message).toContain('Not authorized')
    })
  })

  describe('DELETE /api/characters/:id', () => {
    it('deletes character when user is owner', async () => {
      const existingCharacter = {
        id: 'char-123',
        name: 'Boromir',
        user_id: 'test-user-1',
      }

      // Mock fetch to verify ownership
      const mockSingleFetch = jest.fn().mockResolvedValue({ data: existingCharacter, error: null })
      const mockEqFetch = jest.fn().mockReturnValue({ single: mockSingleFetch })
      const mockSelectFetch = jest.fn().mockReturnValue({ eq: mockEqFetch })

      // Mock delete operation
      const mockEqDelete = jest.fn().mockResolvedValue({ error: null })
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEqDelete })

      ;(supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelectFetch }) // First call for verification
        .mockReturnValueOnce({ delete: mockDelete }) // Second call for delete

      const response = await request(app).delete('/api/characters/char-123')

      expect(response.status).toBe(204)
    })

    it('returns 403 when user is not owner', async () => {
      const otherUserCharacter = {
        id: 'char-123',
        name: 'Saruman',
        user_id: 'evil-user',
      }

      const mockSingle = jest.fn().mockResolvedValue({ data: otherUserCharacter, error: null })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const response = await request(app).delete('/api/characters/char-123')

      expect(response.status).toBe(403)
      expect(response.body.error.message).toContain('Not authorized')
    })

    it('returns 404 when character not found', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Supabase not found error
      })
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
      ;(supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })

      const response = await request(app).delete('/api/characters/nonexistent')

      expect(response.status).toBe(404)
      expect(response.body.error.message).toContain('not found')
    })
  })
})
