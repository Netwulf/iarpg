import { test as base, Page } from '@playwright/test';

/**
 * Auth Fixture - Provides automatic login functionality for tests
 *
 * Usage:
 * import { test } from '../fixtures/auth.fixture';
 *
 * test('my authenticated test', async ({ authenticatedPage }) => {
 *   // User is already logged in
 *   await authenticatedPage.goto('/dashboard');
 * });
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login before each test
    await page.goto('/login');

    // Fill in test user credentials from env
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard (successful login)
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Provide the authenticated page to the test
    await use(page);

    // Cleanup: logout after test (optional)
    // This ensures test isolation
    try {
      if (page.url().includes('dashboard') || page.url().includes('characters') || page.url().includes('tables')) {
        // Try to logout if still on authenticated page
        await page.click('[data-testid="user-menu"]', { timeout: 2000 });
        await page.click('text=Logout', { timeout: 2000 });
      }
    } catch (error) {
      // Ignore logout errors (page might have navigated away)
    }
  },
});

export { expect } from '@playwright/test';

/**
 * Helper function to login with custom credentials
 * Useful for multi-user tests
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*dashboard/, { timeout: 10000 });
}

/**
 * Helper function to logout
 */
export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Logout');
  await page.waitForURL(/.*login/, { timeout: 5000 });
}
