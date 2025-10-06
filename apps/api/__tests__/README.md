# Unit Tests - Backend API

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
├── routes/           # Route/controller tests
│   └── example.test.ts
├── middleware/       # Middleware tests
└── mocks/            # Mock implementations
    ├── supabase.mock.ts
    └── express.mock.ts
```

## ✍️ Writing Tests

### Route Test Example

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
      .send({ name: 'Aragorn', class: 'ranger', level: 1 })

    expect(response.status).toBe(201)
    expect(response.body.character).toHaveProperty('id')
  })
})
```

### Controller Test Example

```typescript
import { mockRequest, mockResponse, mockNext } from '../mocks/express.mock'

describe('Character Controller', () => {
  it('creates character successfully', async () => {
    const req = mockRequest({ body: { name: 'Gandalf' } })
    const res = mockResponse()

    await createCharacter(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalled()
  })
})
```

### Middleware Test Example

```typescript
import { mockRequest, mockResponse, mockNext } from '../mocks/express.mock'
import { authMiddleware } from '@/middleware/auth'

describe('Auth Middleware', () => {
  it('allows authenticated requests', async () => {
    const req = mockRequest({ headers: { authorization: 'Bearer valid-token' } })
    const res = mockResponse()
    const next = mockNext()

    await authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('blocks unauthenticated requests', async () => {
    const req = mockRequest()
    const res = mockResponse()
    const next = mockNext()

    await authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})
```

## 🎯 Testing Guidelines

1. **Test HTTP contracts, not implementation**
   - ✅ `expect(response.status).toBe(200)`
   - ✅ `expect(response.body).toHaveProperty('id')`
   - ❌ Testing internal function calls

2. **Use Supertest for integration tests**
   - Tests entire request/response cycle
   - No need to start server manually
   - Clean and readable syntax

3. **Mock database calls**
   - Use Supabase mocks
   - Don't hit real database
   - Fast execution

4. **Test error cases**
   - Invalid input validation
   - Database errors
   - Authentication failures

## 📊 Coverage

Run `pnpm test:coverage` to see coverage report.

Coverage thresholds: **50%** (baseline, will increase to 70%)

View HTML report: `open coverage/lcov-report/index.html`

## 🔧 Configuration

- **Config:** `jest.config.js`
- **Setup:** `jest.setup.js`
- **Mocks:** `__tests__/mocks/`

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/ladjs/supertest)
- [Testing Express Apps](https://expressjs.com/en/guide/testing.html)

---

**Setup Completed:** ✅ WEEK2.2
**Story:** `/docs/stories/WEEK2.2.setup-jest-unit-tests.md`
