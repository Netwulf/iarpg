import { mockRequest, mockResponse, mockNext } from '../mocks/express.mock'

/**
 * Example smoke test to validate Jest setup for API
 */
describe('Jest Setup - API', () => {
  it('runs basic test', () => {
    expect(true).toBe(true)
  })

  it('has access to Express mocks', () => {
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    expect(req).toBeDefined()
    expect(res).toBeDefined()
    expect(next).toBeDefined()
  })

  it('can mock Express request/response', () => {
    const req = mockRequest({ body: { name: 'test' } })
    const res = mockResponse()

    expect(req.body).toEqual({ name: 'test' })
    expect(res.status).toBeDefined()
    expect(res.json).toBeDefined()
  })
})

/**
 * Example route test pattern
 */
describe('Example Route Test Pattern', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('demonstrates controller testing', async () => {
    // Example controller
    const exampleController = async (req: any, res: any) => {
      const data = { message: 'Hello from API' }
      return res.status(200).json(data)
    }

    const req = mockRequest()
    const res = mockResponse()

    await exampleController(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'Hello from API' })
  })

  it('demonstrates error handling', async () => {
    const errorController = async (req: any, res: any) => {
      try {
        throw new Error('Test error')
      } catch (error: any) {
        return res.status(500).json({ error: error.message })
      }
    }

    const req = mockRequest()
    const res = mockResponse()

    await errorController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Test error' })
  })
})
