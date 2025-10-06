import { Request, Response, NextFunction } from 'express'

/**
 * Mock Express Request
 */
export function mockRequest(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: { id: 'test-user-1', email: 'test@example.com' },
    ...overrides,
  }
}

/**
 * Mock Express Response
 */
export function mockResponse(): Partial<Response> {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
  }
  return res
}

/**
 * Mock Express Next Function
 */
export function mockNext(): NextFunction {
  return jest.fn()
}
