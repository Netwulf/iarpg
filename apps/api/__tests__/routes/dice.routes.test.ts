import request from 'supertest'
import express from 'express'

// Mock DiceRoller before importing routes
jest.mock('@iarpg/shared', () => ({
  DiceRoller: {
    roll: jest.fn((notation: string) => ({
      notation,
      rolls: [15],
      total: 18,
      modifier: 3,
      type: 'normal',
      breakdown: '1d20+3: [15] + 3 = 18',
    })),
    rollWithAdvantage: jest.fn((notation: string) => ({
      notation,
      rolls: [18, 12],
      total: 21,
      modifier: 3,
      type: 'advantage',
      breakdown: '1d20+3 (advantage): [18, 12] + 3 = 21',
    })),
    rollWithDisadvantage: jest.fn((notation: string) => ({
      notation,
      rolls: [8, 14],
      total: 11,
      modifier: 3,
      type: 'disadvantage',
      breakdown: '1d20+3 (disadvantage): [8, 14] + 3 = 11',
    })),
    isCriticalSuccess: jest.fn(() => false),
  },
}))

// Mock authentication middleware
jest.mock('@/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { id: 'test-user-1', email: 'test@example.com', username: 'TestPlayer' }
    next()
  },
}))

// Mock Supabase for table membership check
jest.mock('@iarpg/db', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { owner_id: 'test-user-1' }, // Mock user as table owner
            error: null
          })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'msg-1' },
            error: null
          })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    }))
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
import diceRouter from '@/routes/dice.routes'
import { errorMiddleware } from '@/middleware/error.middleware'

// Create Express app for testing
const app = express()
app.use(express.json())
app.use('/api/tables', diceRouter)
app.use(errorMiddleware)

describe('Dice Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/tables/:id/roll', () => {
    it('rolls dice with valid notation', async () => {
      const tableId = 'table-123'
      const notation = '1d20+3'

      const response = await request(app)
        .post(`/api/tables/${tableId}/roll`)
        .send({ notation, reason: 'Attack roll' })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('total')
      expect(response.body.total).toBe(18)
      expect(response.body.notation).toBe(notation)
      expect(response.body.reason).toBe('Attack roll')
    })

    it('rejects missing notation with 400 error', async () => {
      const tableId = 'table-123'

      const response = await request(app)
        .post(`/api/tables/${tableId}/roll`)
        .send({ reason: 'Attack roll' }) // Missing notation

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('notation is required')
    })

    it('rolls with advantage when specified', async () => {
      const { DiceRoller } = require('@iarpg/shared')
      const tableId = 'table-123'
      const notation = '1d20+3'

      const response = await request(app)
        .post(`/api/tables/${tableId}/roll`)
        .send({ notation, advantage: true })

      expect(response.status).toBe(201)
      expect(response.body.total).toBe(21)
      expect(DiceRoller.rollWithAdvantage).toHaveBeenCalledWith(notation)
    })

    it('rolls with disadvantage when specified', async () => {
      const { DiceRoller } = require('@iarpg/shared')
      const tableId = 'table-123'
      const notation = '1d20+3'

      const response = await request(app)
        .post(`/api/tables/${tableId}/roll`)
        .send({ notation, disadvantage: true })

      expect(response.status).toBe(201)
      expect(response.body.total).toBe(11)
      expect(DiceRoller.rollWithDisadvantage).toHaveBeenCalledWith(notation)
    })

    it('handles invalid dice notation with 400 error', async () => {
      const { DiceRoller } = require('@iarpg/shared')
      const tableId = 'table-123'

      // Mock DiceRoller to throw error
      DiceRoller.roll.mockImplementationOnce(() => {
        throw new Error('Invalid dice notation')
      })

      const response = await request(app)
        .post(`/api/tables/${tableId}/roll`)
        .send({ notation: 'invalid-dice' })

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('Invalid dice notation')
    })
  })
})
