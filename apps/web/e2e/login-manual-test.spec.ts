import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Login Manual Test', () => {
  test('login with known user credentials', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`[${msg.type()}]`, msg.text());
    });

    page.on('pageerror', err => {
      console.error('❌ Page error:', err);
    });

    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    console.log('✅ Navigated to login page');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check if form elements exist
    const emailInput = await page.locator('input[name="email"]').isVisible();
    const passwordInput = await page.locator('input[name="password"]').isVisible();
    const submitButton = await page.locator('button[type="submit"]').isVisible();

    console.log('Form elements visible:', { emailInput, passwordInput, submitButton });

    // Use the test user we created earlier
    await page.fill('input[name="email"]', 'test-playwright-1759842592@test.com');
    await page.fill('input[name="password"]', 'Test1234!');
    console.log('✅ Filled login form');

    // Intercept auth requests
    const signInRequest = page.waitForResponse(
      response => response.url().includes('/api/auth') && response.request().method() === 'POST',
      { timeout: 10000 }
    ).catch(() => null);

    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Clicked submit button');

    // Wait for response
    const response = await signInRequest;
    if (response) {
      console.log(`📡 Auth response: ${response.status()} ${response.url()}`);
      try {
        const body = await response.text();
        console.log('Response body:', body.substring(0, 200));
      } catch (e) {
        console.log('Could not read response body');
      }
    } else {
      console.log('⚠️ No auth request captured');
    }

    // Wait and check current URL
    await page.waitForTimeout(5000);
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);

    // Check for error messages
    const errorVisible = await page.locator('[role="alert"], .error-message, [class*="error"]').first().isVisible().catch(() => false);
    if (errorVisible) {
      const errorText = await page.locator('[role="alert"], .error-message, [class*="error"]').first().textContent();
      console.log('❌ Error message:', errorText);
    }

    // Check cookies
    const cookies = await page.context().cookies();
    console.log('Cookies:', cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`));

    // Take screenshot
    await page.screenshot({ path: 'login-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved to login-test-result.png');
  });
});
