# E2E Tests - Playwright Setup

## 📝 Overview

This directory contains end-to-end (E2E) tests using Playwright. These tests simulate real user interactions with the application in a browser.

## 🚀 Quick Start

### Run all tests
```bash
pnpm test:e2e
```

### Run tests in UI mode (visual debugger)
```bash
pnpm test:e2e:ui
```

### Run tests in debug mode
```bash
pnpm test:e2e:debug
```

### View HTML report after tests
```bash
pnpm test:e2e:report
```

## 📁 Directory Structure

```
e2e/
├── fixtures/
│   └── auth.fixture.ts       # Authentication fixture (auto-login)
├── utils/
│   ├── test-helpers.ts       # Common test utilities
│   └── test-data.ts          # Test data generators
├── example.spec.ts           # Smoke tests (validates setup)
└── README.md                 # This file
```

## 🔧 Configuration

### Test Environment Variables (`.env.test`)

```env
BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
TEST_USER_EMAIL=test1@iarpg.local
TEST_USER_PASSWORD=TestPassword123!
```

### Playwright Config (`playwright.config.ts`)

- **Browsers:** Chromium (Firefox and WebKit commented out)
- **Workers:** 3 in dev, 1 in CI
- **Retries:** 0 in dev, 2 in CI
- **Screenshots:** On failure only
- **Videos:** On failure only
- **Traces:** On first retry

## ✍️ Writing Tests

### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/IA-RPG/);
});
```

### Authenticated Test

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('dashboard test', async ({ authenticatedPage }) => {
  // User is already logged in
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.locator('h1')).toBeVisible();
});
```

### Using Test Helpers

```typescript
import { navigateTo, waitForLoadingToComplete } from './utils/test-helpers';

test('using helpers', async ({ page }) => {
  await navigateTo(page, '/characters');
  await waitForLoadingToComplete(page);
});
```

### Using Test Data Generators

```typescript
import { generateTestCharacter, generateTestEmail } from './utils/test-data';

test('create character', async ({ authenticatedPage }) => {
  const character = generateTestCharacter({ name: 'Aragorn', class: 'ranger' });

  // Use character data in test...
});
```

## 🧪 Test Categories

### Smoke Tests (`example.spec.ts`)
- Validates Playwright setup
- Tests basic page loads
- Tests auth navigation
- **Note:** Some tests are skipped until test users are created in Supabase

### Critical Flow Tests (To be added in WEEK2.3)
- Auth flow
- Character creation
- Table creation
- Real-time messaging
- Dice rolling
- Combat tracker
- Dashboard stats
- Table browser
- WebSocket reconnect
- Mobile responsive

## ⚙️ Setup Requirements

### 1. Test Users in Supabase

Before running authenticated tests, create test users in Supabase:

```sql
INSERT INTO users (id, email, username, tier, created_at)
VALUES
  ('test-user-1-uuid', 'test1@iarpg.local', 'testuser1', 'free', NOW()),
  ('test-user-2-uuid', 'test2@iarpg.local', 'testuser2', 'premium', NOW());
```

Then set passwords using Supabase Auth (or insert into auth.users table directly).

### 2. Running Dev Server

Playwright auto-starts the dev server (`pnpm dev`) before tests.
If you want to run against an already-running server, it will reuse it.

### 3. Environment Variables

Copy `.env.test.example` to `.env.test` and fill in values:
- Test user credentials
- Base URL (localhost or staging)
- API URL

## 📊 Test Reports

After running tests, view the HTML report:

```bash
pnpm test:e2e:report
```

Reports are saved to `playwright-report/` directory.

## 🐛 Debugging

### Visual Debugger

```bash
pnpm test:e2e:ui
```

This opens Playwright's UI mode where you can:
- See all tests
- Run tests one by one
- View screenshots
- Inspect DOM
- Time-travel through test execution

### Debug Mode

```bash
pnpm test:e2e:debug
```

This runs tests with Playwright Inspector, allowing you to:
- Step through test code
- Pause on errors
- Inspect page state

### Screenshots & Videos

On test failure:
- Screenshot: `test-results/<test-name>/<retry>/test-failed-1.png`
- Video: `test-results/<test-name>/<retry>/video.webm`
- Trace: `test-results/<test-name>/<retry>/trace.zip`

View trace:
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

## 🔄 CI/CD Integration

Playwright is CI-ready. In GitHub Actions:

```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: pnpm test:e2e
  env:
    CI: true

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## ⚠️ Important Notes

- **Never** run tests against production database
- Use test users with `@iarpg.local` domain
- Tests should be isolated (no shared state)
- Tests should cleanup after themselves
- Use `test.skip()` for tests that require setup not yet done

## 🎯 Next Steps

1. Create test users in Supabase
2. Unskip auth tests in `example.spec.ts`
3. Run smoke tests: `pnpm test:e2e`
4. Add more E2E tests in WEEK2.3

---

**Setup Completed:** ✅ WEEK2.1
**Story:** `/docs/stories/WEEK2.1.setup-playwright-e2e.md`
**PO:** Sarah
