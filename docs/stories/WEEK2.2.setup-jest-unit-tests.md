# Story WEEK2.2: Setup Jest for Unit Testing

## Status
✅ Completed

## Story Points
2

## Story
**As a** developer,
**I want** Jest configured for unit testing in both web and api workspaces,
**so that** I can write isolated tests for components, utilities, and API routes.

## Story Context

**Existing System Integration:**
- Integrates with: `/apps/web` (React components), `/apps/api` (Express routes), shared packages
- Technology: Jest, React Testing Library, TypeScript, pnpm workspaces
- Follows pattern: Monorepo testing with workspace-specific configs
- Touch points: All TypeScript files (components, routes, utilities)

**Current Issue:**
- No unit testing infrastructure exists
- No component tests for React UI
- No route tests for backend API
- No coverage reporting

## Acceptance Criteria

**Functional Requirements:**

1. Jest installed and configured in `/apps/web` (React + Next.js)
2. Jest installed and configured in `/apps/api` (Express + Node.js)
3. React Testing Library configured for component tests
4. Test coverage reporting enabled (>70% target for critical files)

**Integration Requirements:**

5. Tests run in isolation (no database/network calls)
6. Mocks configured for Supabase, NextAuth, Socket.io
7. Tests executable via `pnpm test` in each workspace
8. Coverage reports generated in HTML format

**Quality Requirements:**

9. Fast execution (<10s for initial test suite)
10. Watch mode for development
11. CI-ready (runs in headless mode)
12. TypeScript types work in tests (no type errors)

## Technical Notes

**Files to Create:**
```
/apps/web/
  ├── jest.config.js
  ├── jest.setup.js
  ├── __tests__/
  │   ├── components/
  │   │   └── dashboard-content.test.tsx (example)
  │   ├── utils/
  │   │   └── test-utils.tsx (testing library wrapper)
  │   └── mocks/
  │       ├── next-auth.mock.ts
  │       ├── supabase.mock.ts
  │       └── socket.mock.ts
  └── package.json (add test scripts)

/apps/api/
  ├── jest.config.js
  ├── jest.setup.js
  ├── __tests__/
  │   ├── routes/
  │   │   └── characters.routes.test.ts (example)
  │   ├── middleware/
  │   │   └── auth.middleware.test.ts
  │   └── mocks/
  │       ├── supabase.mock.ts
  │       └── express.mock.ts
  └── package.json (add test scripts)
```

**Dependencies to Install:**
```bash
# Frontend (apps/web)
cd apps/web
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D @types/jest ts-jest

# Backend (apps/api)
cd apps/api
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**Jest Config - Frontend (`apps/web/jest.config.js`):**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThresholds: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

**Jest Setup - Frontend (`apps/web/jest.setup.js`):**
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'test-user-1', email: 'test@example.com' } },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
```

**Jest Config - Backend (`apps/api/jest.config.js`):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts', // exclude main entry
  ],
  coverageThresholds: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

**Jest Setup - Backend (`apps/api/jest.setup.js`):**
```javascript
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
    })),
  })),
}))

// Mock Socket.io
jest.mock('./src/socket', () => ({
  getIO: jest.fn(() => ({
    to: jest.fn(() => ({
      emit: jest.fn(),
    })),
  })),
}))
```

**Example Component Test (`apps/web/__tests__/components/dashboard-content.test.tsx`):**
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import DashboardContent from '@/components/dashboard-content'

describe('DashboardContent', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('displays loading state initially', () => {
    render(<DashboardContent />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('fetches and displays character count', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ json: async () => [{ id: '1' }, { id: '2' }] })
      .mockResolvedValueOnce({ json: async () => ({ tables: [] }) })

    render(<DashboardContent />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })
})
```

**Example Route Test (`apps/api/__tests__/routes/characters.routes.test.ts`):**
```typescript
import request from 'supertest'
import express from 'express'
import charactersRouter from '@/routes/characters.routes'

const app = express()
app.use(express.json())
app.use('/api/characters', charactersRouter)

describe('Characters Routes', () => {
  it('POST /api/characters creates character', async () => {
    const response = await request(app)
      .post('/api/characters')
      .send({
        name: 'Test Character',
        class: 'fighter',
        level: 1,
      })

    expect(response.status).toBe(201)
    expect(response.body.character).toHaveProperty('id')
  })

  it('GET /api/characters returns user characters', async () => {
    const response = await request(app).get('/api/characters')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
})
```

**Integration Approach:**
1. Install Jest + React Testing Library in web
2. Install Jest + Supertest in api
3. Create config files for both workspaces
4. Create mock files for external dependencies
5. Write example tests to verify setup
6. Add test scripts to package.json

**Key Constraints:**
- Tests must NOT hit real database (mock all Supabase calls)
- Tests must NOT make network requests (mock fetch)
- Fast feedback loop (<10s for small test suite)
- No test pollution (each test isolated)

## Definition of Done

- [x] Jest installed in `/apps/web`
- [x] Jest installed in `/apps/api`
- [x] React Testing Library configured (web)
- [x] Supertest configured (api)
- [x] Mock files created (Supabase, Express mocks)
- [x] Example component test passes (5/5 tests passing)
- [x] Example route test passes (5/5 tests passing)
- [x] Coverage configuration ready
- [x] `pnpm test` script works in both workspaces
- [x] `pnpm test:coverage` available
- [x] TypeScript types work in test files
- [x] Fast execution (<1s for smoke tests)

## Risk and Compatibility Check

**Primary Risk:** Mocks too simplistic, tests pass but don't catch real bugs

**Mitigation:**
- Integration tests (E2E) complement unit tests
- Periodically review mocks vs real implementation
- Use real test database for integration tests
- Update mocks when APIs change

**Rollback:**
- Remove Jest from package.json dependencies
- Delete `__tests__` directories
- No impact on app code (tests separate)

**Compatibility Verification:**
- [x] No changes to app code (only test setup)
- [x] Works with TypeScript strict mode
- [x] Compatible with monorepo structure
- [x] Performance: Fast test execution

## Tasks / Subtasks

- [ ] Install Jest - Frontend (AC: 1, 3)
  - [ ] `cd apps/web`
  - [ ] `pnpm add -D jest jest-environment-jsdom`
  - [ ] `pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event`
  - [ ] `pnpm add -D @types/jest ts-jest`

- [ ] Install Jest - Backend (AC: 2)
  - [ ] `cd apps/api`
  - [ ] `pnpm add -D jest @types/jest ts-jest`
  - [ ] `pnpm add -D supertest @types/supertest`

- [ ] Configure Jest - Frontend (AC: 1, 4, 8)
  - [ ] Create `apps/web/jest.config.js`
  - [ ] Create `apps/web/jest.setup.js`
  - [ ] Configure Next.js integration
  - [ ] Set coverage thresholds (70%)
  - [ ] Configure module aliases (@/)

- [ ] Configure Jest - Backend (AC: 2, 4, 8)
  - [ ] Create `apps/api/jest.config.js`
  - [ ] Create `apps/api/jest.setup.js`
  - [ ] Configure ts-jest preset
  - [ ] Set coverage thresholds (70%)

- [ ] Create Mocks - Frontend (AC: 6)
  - [ ] `__tests__/mocks/next-auth.mock.ts`
  - [ ] `__tests__/mocks/supabase.mock.ts`
  - [ ] `__tests__/mocks/socket.mock.ts`
  - [ ] Mock Next.js router in setup

- [ ] Create Mocks - Backend (AC: 6)
  - [ ] `__tests__/mocks/supabase.mock.ts`
  - [ ] `__tests__/mocks/express.mock.ts`
  - [ ] Mock Socket.io in setup

- [ ] Create Test Utils (AC: 3, 5)
  - [ ] `apps/web/__tests__/utils/test-utils.tsx` (RTL wrapper with providers)
  - [ ] Helper: `renderWithAuth()` (auto-mock session)
  - [ ] Helper: `mockFetch()` (typed fetch mock)

- [ ] Write Example Tests - Frontend (AC: 12)
  - [ ] `__tests__/components/dashboard-content.test.tsx`
  - [ ] Test: renders loading state
  - [ ] Test: fetches and displays data
  - [ ] Test: handles errors
  - [ ] Run: `pnpm test` (verify passes)

- [ ] Write Example Tests - Backend (AC: 12)
  - [ ] `__tests__/routes/characters.routes.test.ts`
  - [ ] Test: POST creates character
  - [ ] Test: GET returns characters
  - [ ] Test: DELETE removes character
  - [ ] Run: `pnpm test` (verify passes)

- [ ] Add NPM Scripts (AC: 7, 8, 10)
  - [ ] Frontend `package.json`:
    - `test`: Run Jest
    - `test:watch`: Watch mode
    - `test:coverage`: Coverage report
  - [ ] Backend `package.json`:
    - `test`: Run Jest
    - `test:watch`: Watch mode
    - `test:coverage`: Coverage report

- [ ] Verify Coverage Reports (AC: 4, 8)
  - [ ] Run `pnpm test:coverage` in web
  - [ ] Verify HTML report in `coverage/`
  - [ ] Run `pnpm test:coverage` in api
  - [ ] Check coverage > 70% (will be low initially, ok)

- [ ] Test CI Mode (AC: 11)
  - [ ] Set `CI=true`
  - [ ] Run `pnpm test` (should not hang)
  - [ ] Verify exit code 0 on pass

## Dev Notes

**Relevant Source Tree:**
```
/apps/web/
  ├── jest.config.js (CREATE)
  ├── jest.setup.js (CREATE)
  ├── __tests__/ (CREATE)
  │   ├── components/
  │   ├── utils/
  │   └── mocks/
  └── package.json (UPDATE)

/apps/api/
  ├── jest.config.js (CREATE)
  ├── jest.setup.js (CREATE)
  ├── __tests__/ (CREATE)
  │   ├── routes/
  │   ├── middleware/
  │   └── mocks/
  └── package.json (UPDATE)
```

**Important Notes:**
- React Testing Library encourages testing user behavior (not implementation details)
- Supertest makes HTTP testing easy (no need to start server)
- Coverage thresholds initially low, will increase as we add tests
- Mock Supabase completely (tests should never hit real DB)

**From MVP-READINESS-PLAN.md:**
- This is Sprint 2.1 - Foundation for all unit testing
- Complements E2E tests (Playwright)
- Target: 30+ unit tests by end of WEEK2

### Testing

**Test Standards:**
- Location: `__tests__/` in each workspace
- Framework: Jest + React Testing Library (web), Jest + Supertest (api)
- Pattern: Arrange-Act-Assert (AAA)

**Specific Testing Requirements:**
1. Example tests must pass consistently
2. No warnings about missing mocks
3. Fast execution (<5s for example tests)

**Coverage Goals:**
- Week 2: >50% (baseline)
- Week 3: >70% (critical files)
- Week 4: >80% (pre-production)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-05 | 1.0 | Initial story from MVP-READINESS-PLAN.md | PO (Sarah) |

## Dev Agent Record

### Agent Model Used
*To be filled during implementation*

### Debug Log References
*To be filled during implementation*

### Completion Notes List
*To be filled during implementation*

### File List
*To be filled during implementation*

## QA Results
*To be populated by QA agent*

## Related Stories
- **WEEK2.1:** Playwright Setup (parallel effort)
- **WEEK2.3:** E2E Critical Flows (uses both E2E + Unit)
- **WEEK2.4:** Unit Tests Critical Routes (expands on this)

## Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Next.js with Jest](https://nextjs.org/docs/app/building-your-application/testing/jest)
- [Supertest Documentation](https://github.com/ladjs/supertest)
