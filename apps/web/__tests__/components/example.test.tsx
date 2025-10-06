import { render, screen } from '../utils/test-utils'

/**
 * Example smoke test to validate Jest setup
 */
describe('Jest Setup', () => {
  it('runs basic test', () => {
    expect(true).toBe(true)
  })

  it('can render React components', () => {
    const TestComponent = () => <div>Hello Test</div>

    render(<TestComponent />)

    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })

  it('has access to testing utilities', () => {
    expect(screen).toBeDefined()
    expect(render).toBeDefined()
  })
})

/**
 * Example component test pattern
 */
describe('Example Component Test Pattern', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  it('demonstrates async testing', async () => {
    const fetchData = async () => {
      return Promise.resolve('test data')
    }

    const data = await fetchData()
    expect(data).toBe('test data')
  })

  it('demonstrates mock functions', () => {
    const mockFn = jest.fn()

    mockFn('test')

    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
