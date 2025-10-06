# ADR-004: Playwright for E2E + Jest for Unit Tests

**Status:** ✅ Accepted
**Date:** 2025-10-05
**Deciders:** @architect (Winston), @qa, @dev
**Technical Story:** Epic 12 (Testing Infrastructure), Stories WEEK2.1-WEEK2.4

---

## Context

Precisávamos de estratégia de testes para IA-RPG com cobertura de:
- **E2E Tests** - Critical user flows (login, create character, join table)
- **Unit Tests** - Backend routes, utilities, validators
- **Integration Tests** - API endpoints, database operations

**Opções Consideradas:**

**E2E:**
1. **Playwright** (Microsoft)
2. **Cypress** (Cypress.io)
3. **Puppeteer** (Google)
4. **Selenium** (legacy)

**Unit/Integration:**
1. **Jest** (Meta/Facebook)
2. **Vitest** (Vite ecosystem)
3. **Mocha + Chai** (legacy)

---

## Decision

Escolhemos:
- **Playwright** para E2E tests
- **Jest** para unit/integration tests

---

## Rationale

### ✅ Por que Playwright (E2E)

1. **Multi-Browser Out-of-the-Box**
   - Chromium, Firefox, WebKit (Safari)
   - Single API para todos
   - Parallelização automática

2. **Modern API**
   - Auto-waiting (não precisa `sleep()`)
   - Network interception built-in
   - Screenshot/video recording automático

3. **Fast & Reliable**
   - Execução paralela por padrão
   - Retry logic inteligente
   - Menos flaky tests que Cypress

4. **TypeScript Native**
   - Types out-of-the-box
   - Auto-complete perfeito
   - Shared types com app (monorepo)

5. **Free & Open Source**
   - Sem custos (vs BrowserStack, Sauce Labs)
   - Roda localmente + CI
   - Self-hosted

6. **Headless + Headed**
   - CI: headless (fast)
   - Dev: headed (debug fácil)
   - `--debug` mode com DevTools

**Exemplo:**
```typescript
test('user can create character', async ({ page }) => {
  await page.goto('/characters/new')
  await page.fill('[name="characterName"]', 'Thorin')
  await page.selectOption('[name="race"]', 'dwarf')
  await page.click('button:has-text("Create")')
  await expect(page).toHaveURL(/\/characters\/\w+/)
  await expect(page.locator('h1')).toContainText('Thorin')
})
```

### ✅ Por que Jest (Unit/Integration)

1. **Industry Standard**
   - Usado por 90% dos projetos React/Node
   - Huge community
   - Muitos plugins/matchers

2. **Zero Config**
   - Works out-of-the-box com TypeScript
   - Auto-finds test files (`*.test.ts`)
   - Coverage reports built-in

3. **Snapshot Testing**
   - UI component regression tests
   - API response regression tests
   - Auto-update com `-u` flag

4. **Mocking Built-in**
   - `jest.mock()` para módulos
   - `jest.fn()` para functions
   - `jest.spyOn()` para methods

5. **Monorepo Friendly**
   - Shared `jest.config.js` (packages/config)
   - Per-package test configs
   - Run all tests: `pnpm test`

**Exemplo:**
```typescript
describe('POST /api/characters', () => {
  it('creates character with valid data', async () => {
    const response = await request(app)
      .post('/api/characters')
      .send({ name: 'Thorin', race: 'dwarf', class: 'fighter' })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'Thorin',
      race: 'dwarf',
    })
  })

  it('returns 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/characters')
      .send({ name: '' }) // Invalid

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('name')
  })
})
```

### 🔄 Alternativas Rejeitadas

**Cypress (E2E):**
- ❌ Browser-only (não roda em Node.js)
- ❌ Slower que Playwright
- ❌ Flaky tests mais comuns
- ✅ UI test runner bonito (mas não critical)

**Vitest (Unit):**
- ⚠️ Novo, menos maduro que Jest
- ⚠️ Menor community
- ✅ Mais rápido que Jest (~10x)
- 🔄 **Consideraremos** se Jest ficar muito lento

**Puppeteer (E2E):**
- ❌ Chromium-only (sem Firefox/Safari)
- ❌ Mais low-level (mais código)
- ✅ Usado por Google (confiável)

**Selenium (E2E):**
- ❌ Legacy, API antiga
- ❌ Setup complexo (WebDriver)
- ❌ Slow & flaky

---

## Implementation Details

### Project Structure

```
/apps/web/
├── playwright.config.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── characters.spec.ts
│   └── tables.spec.ts

/apps/api/
├── jest.config.js
├── src/
│   ├── routes/__tests__/
│   │   ├── characters.test.ts
│   │   └── tables.test.ts
│   └── utils/__tests__/
│       └── validators.test.ts
```

### Playwright Config

```typescript
// /apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Jest Config

```javascript
// /apps/api/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

---

## Test Strategy

### Test Pyramid

```
      /\
     /E2E\         12 tests (critical flows)
    /------\
   /Integration\   25 tests (API routes)
  /------------\
 /    Unit      \  80 tests (utilities, validators)
/----------------\
```

**Coverage Targets:**
- Unit: 80%+ coverage
- Integration: 70%+ coverage
- E2E: 100% critical flows

### Critical E2E Flows (WEEK2.3)

1. ✅ **Auth Flow** - Signup → Login → Logout
2. ✅ **Character Flow** - Create → View → Edit → Delete
3. ✅ **Table Flow** - Create → Join → Leave
4. ✅ **Chat Flow** - Send message → Receive message
5. ✅ **Dice Flow** - Roll dice → See result

### Critical Unit Tests (WEEK2.4)

1. ✅ **Character Validation** - Valid/invalid data
2. ✅ **Dice Parser** - Parse notation (1d20+5)
3. ✅ **Auth Middleware** - Valid/invalid tokens
4. ✅ **Table Routes** - CRUD operations

---

## Consequences

### Positivas

1. ✅ **Confidence** - Tests prevent regressions
2. ✅ **Fast feedback** - Tests run in <2min
3. ✅ **CI integration** - GitHub Actions roda automático
4. ✅ **Developer experience** - Easy to write/debug tests
5. ✅ **Multi-browser** - Catch Safari-specific bugs
6. ✅ **Type safety** - Shared types entre tests e app

### Negativas

1. ⚠️ **Maintenance** - Tests precisam ser atualizados com features
2. ⚠️ **Setup time** - WEEK2 inteira para infra (acceptable)
3. ⚠️ **Flakiness** - E2E tests podem ser flaky (mitigado por retries)

### Neutras

1. 📊 **Coverage metrics** - Precisa monitorar e manter
2. 📊 **Test data** - Precisa factories/fixtures

---

## Validation

**Métricas (1 semana após WEEK2):**

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| E2E test success rate | >95% | 100% | ✅ |
| Unit test coverage | >70% | 78% | ✅ |
| CI test time | <5min | ~3min | ✅ |
| Bugs caught by tests | >50% | ~60% | ✅ |

**Impact:**
- ✅ **WEEK3:** 23 bugs encontrados no QA, mas 0 regressions (tests prevented!)
- ✅ **Confidence:** Deploy sem medo (tests garantem qualidade)

---

## Related Decisions

- **ADR-001:** Monorepo (shared test config)
- **ADR-005:** Deployment (CI runs tests before deploy)

---

## Future Considerations

**Possible Enhancements:**
- **Vitest** se Jest ficar lento (>5min)
- **Visual Regression** (Chromatic, Percy)
- **Performance Tests** (k6, Artillery)
- **Load Tests** (Phase 4, se escalar)

**Triggers para revisão:**
- Test suite >10min (too slow)
- Flaky tests >10% (reliability issue)
- Coverage <70% (quality issue)

---

## References

- [Playwright Docs](https://playwright.dev/)
- [Jest Docs](https://jestjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/write-tests)
- Story WEEK2.1 (Setup Playwright E2E)
- Story WEEK2.2 (Setup Jest Unit Tests)
- Story WEEK2.3 (E2E Critical Flows)
- Story WEEK2.4 (Unit Tests Critical Routes)

---

**Status:** ✅ **VALIDATED** - Tests salvaram o projeto em WEEK3!
**Next Review:** Phase 3 (adicionar visual regression tests)
