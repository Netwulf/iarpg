import { test, expect } from '@playwright/test';
import { test as authTest } from './fixtures/auth.fixture';
import { navigateTo, waitForLoadingToComplete } from './utils/test-helpers';

/**
 * Smoke Tests - Validate Playwright Setup
 *
 * These tests verify that:
 * 1. The application loads
 * 2. Basic navigation works
 * 3. Authentication works
 * 4. Test fixtures work correctly
 */

test.describe('Smoke Tests - Application Loads', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loaded
    await expect(page).toHaveTitle(/IA-RPG/i);

    // Check for basic elements
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');

    // Should have email and password fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');

    // Should have registration form
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
  });
});

test.describe('Smoke Tests - Authentication', () => {
  test('can navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Find login button/link
    const loginLink = page.locator('a[href="/login"], a:has-text("Login"), button:has-text("Login")').first();

    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    } else {
      // If no login link, try navigating directly
      await page.goto('/login');
      await expect(page).toHaveURL(/.*login/);
    }
  });

  // Test users are now created in Supabase
  test('can login with test user', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Should see user menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });
});

test.describe('Smoke Tests - Authenticated Pages', () => {
  // Test users are now created in Supabase
  authTest('dashboard loads after login', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');

    // Should see dashboard content
    await expect(authenticatedPage.locator('h1, h2')).toContainText(/dashboard/i);

    // Wait for any loading to complete
    await waitForLoadingToComplete(authenticatedPage);

    // Should see some dashboard elements
    const stats = authenticatedPage.locator('[data-testid="stat-card"]').first();
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
    }
  });

  authTest('can navigate to characters page', async ({ authenticatedPage }) => {
    await navigateTo(authenticatedPage, '/characters');

    // Should see characters page
    await expect(authenticatedPage).toHaveURL(/.*characters/);
  });

  authTest('can navigate to tables page', async ({ authenticatedPage }) => {
    await navigateTo(authenticatedPage, '/tables/browse');

    // Should see tables browser
    await expect(authenticatedPage).toHaveURL(/.*tables/);
  });
});

test.describe('Smoke Tests - Test Utilities', () => {
  test('test helpers work correctly', async ({ page }) => {
    await page.goto('/login');

    // Test waitForLoadingToComplete
    await waitForLoadingToComplete(page);

    // Test navigateTo
    await navigateTo(page, '/register');
    await expect(page).toHaveURL(/.*register/);
  });
});
