# Unit Tests - Frontend

## 🧪 Quick Start

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## 📁 Directory Structure

```
__tests__/
├── components/       # Component tests
│   └── example.test.tsx
├── utils/            # Test utilities
│   └── test-utils.tsx
└── mocks/            # Mock implementations
    └── supabase.mock.ts
```

## ✍️ Writing Tests

### Component Test Example

```typescript
import { render, screen } from '../utils/test-utils'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Async Test Example

```typescript
import { render, screen, waitFor } from '../utils/test-utils'

it('fetches and displays data', async () => {
  render(<MyComponent />)

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

### Mocking Fetch

```typescript
import { mockFetch } from '../utils/test-utils'

it('handles API calls', async () => {
  mockFetch({ characters: [{ id: '1', name: 'Aragorn' }] })

  render(<CharacterList />)

  await waitFor(() => {
    expect(screen.getByText('Aragorn')).toBeInTheDocument()
  })
})
```

## 🎯 Testing Guidelines

1. **Test user behavior, not implementation details**
   - ✅ `expect(screen.getByRole('button')).toBeInTheDocument()`
   - ❌ `expect(wrapper.state().isLoading).toBe(false)`

2. **Use accessible queries**
   - Prefer: `getByRole`, `getByLabelText`, `getByText`
   - Avoid: `getByTestId` (unless necessary)

3. **Keep tests isolated**
   - Each test should be independent
   - Use `beforeEach` to reset state
   - Clear mocks between tests

4. **Mock external dependencies**
   - API calls (fetch, axios)
   - Supabase client
   - NextAuth session

## 📊 Coverage

Run `pnpm test:coverage` to see coverage report.

Coverage thresholds: **50%** (baseline, will increase to 70%)

View HTML report: `open coverage/lcov-report/index.html`

## 🔧 Configuration

- **Config:** `jest.config.js`
- **Setup:** `jest.setup.js`
- **Test Utils:** `__tests__/utils/test-utils.tsx`

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Next.js](https://nextjs.org/docs/testing)

---

**Setup Completed:** ✅ WEEK2.2
**Story:** `/docs/stories/WEEK2.2.setup-jest-unit-tests.md`
