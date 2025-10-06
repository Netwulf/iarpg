import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Custom render function that wraps components with providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, options)
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

/**
 * Mock fetch with typed response
 */
export function mockFetch(data: any, ok = true) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: async () => data,
      text: async () => JSON.stringify(data),
    } as Response)
  )
}

/**
 * Mock Next.js router
 */
export function mockRouter(overrides: Partial<ReturnType<typeof jest.fn>> = {}) {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    ...overrides,
  }

  require('next/navigation').useRouter = jest.fn(() => router)

  return router
}
