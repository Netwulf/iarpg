import { test, expect } from '@playwright/test';
import { generateTestEmail, generateTestUsername, generateTestPassword } from './utils/test-data';
import { waitForUrl, waitForLoadingToComplete } from './utils/test-helpers';

/**
 * Auth Flow E2E Tests
 *
 * Tests the complete authentication flow:
 * - Register new user
 * - Login with credentials
 * - Logout
 * - Error handling (invalid credentials)
 */

test.describe('Auth Flow', () => {
  let testEmail: string;
  let testUsername: string;
  const testPassword = generateTestPassword();

  test.beforeEach(() => {
    // Generate unique credentials for each test
    testEmail = generateTestEmail();
    testUsername = generateTestUsername();
  });

  test('complete auth flow: register → login → logout', async ({ page }) => {
    // === REGISTER ===
    await page.goto('/register');
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', testPassword);

    // Find and submit the form
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Should redirect to dashboard after successful registration
    await waitForUrl(page, /.*dashboard/, 15000);
    await waitForLoadingToComplete(page);

    // Verify we're logged in (user menu should be visible)
    const userMenu = page.locator('[data-testid="user-menu"], nav a:has-text("Profile"), button:has-text("' + testUsername + '")');
    await expect(userMenu.first()).toBeVisible({ timeout: 10000 });

    // === LOGOUT ===
    // Find logout button (could be in dropdown menu)
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout-button"]');

    // If logout is in a dropdown, open it first
    const userMenuButton = page.locator('[data-testid="user-menu"], button:has-text("' + testUsername + '")').first();
    if (await userMenuButton.isVisible()) {
      await userMenuButton.click();
    }

    await logoutButton.first().click();

    // Should redirect to login or home page
    await page.waitForURL(/\/(login|$)/, { timeout: 5000 });

    // === LOGIN AGAIN ===
    // Navigate to login if not already there
    if (!page.url().includes('/login')) {
      await page.goto('/login');
    }

    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Submit login
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await waitForUrl(page, /.*dashboard/, 10000);
    await waitForLoadingToComplete(page);

    // Verify we're logged in again
    await expect(userMenu.first()).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    // Try to login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@iarpg.local');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message (not redirect)
    await page.waitForTimeout(1000); // Brief wait for error to appear

    // Verify we're still on login page
    await expect(page).toHaveURL(/.*login/);

    // Should show error message
    const errorMessage = page.locator('text=/invalid|incorrect|wrong|error/i, [role="alert"], .error-message');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('register with existing email shows error', async ({ page }) => {
    // First, register a user
    await page.goto('/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for registration to complete
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });

    // Logout
    const userMenuButton = page.locator('[data-testid="user-menu"], button:has-text("' + testUsername + '")').first();
    if (await userMenuButton.isVisible()) {
      await userMenuButton.click();
    }
    await page.locator('button:has-text("Logout"), a:has-text("Logout")').first().click();
    await page.waitForURL(/\/(login|$)/, { timeout: 5000 });

    // Try to register with same email
    await page.goto('/register');
    await page.fill('input[name="email"]', testEmail); // Same email
    await page.fill('input[name="username"]', generateTestUsername()); // Different username
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Should show error (email already exists)
    await page.waitForTimeout(1000);

    // Should stay on register page or show error
    const errorMessage = page.locator('text=/already exists|already registered|email taken/i, [role="alert"], .error-message');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('cannot access protected route when not logged in', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
  });

  test('stay logged in after page refresh', async ({ page }) => {
    // Register and login
    await page.goto('/register');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });

    // Refresh the page
    await page.reload();
    await waitForLoadingToComplete(page);

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/.*dashboard/);

    // User menu should still be visible
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("' + testUsername + '")');
    await expect(userMenu.first()).toBeVisible();
  });
});
