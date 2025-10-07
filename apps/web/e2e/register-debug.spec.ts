import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Registration Debug', () => {
  test('register new user and check auto-login', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testUsername = `user${timestamp}`;
    const testPassword = 'TestPass123!';

    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser error:', msg.text());
      } else {
        console.log('📝 Browser log:', msg.text());
      }
    });

    // Navigate to register page
    await page.goto(`${BASE_URL}/register`);
    console.log('✅ Navigated to register page');

    // Fill registration form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="password"]', testPassword);
    console.log('✅ Filled registration form');

    // Intercept network requests
    const registerRequest = page.waitForResponse(
      response => response.url().includes('/api/auth/register') && response.request().method() === 'POST'
    );
    const signInRequest = page.waitForResponse(
      response => response.url().includes('/api/auth/callback/credentials') && response.request().method() === 'POST'
    );

    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Clicked submit button');

    // Wait for registration response
    const regResponse = await registerRequest;
    const regStatus = regResponse.status();
    const regBody = await regResponse.json();
    console.log(`📡 Register API response: ${regStatus}`, regBody);

    expect(regStatus).toBe(201);

    // Wait for sign in attempt
    try {
      const signInResponse = await signInRequest.catch(() => null);
      if (signInResponse) {
        const signInStatus = signInResponse.status();
        const signInBody = await signInResponse.text();
        console.log(`📡 SignIn API response: ${signInStatus}`, signInBody);
      }
    } catch (e) {
      console.log('⚠️ SignIn request not captured:', e);
    }

    // Check where we ended up
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`🌐 Current URL after registration: ${currentUrl}`);

    // Check for error messages
    const errorElement = await page.locator('[role="alert"], .error-message, [class*="error"]').first();
    const hasError = await errorElement.isVisible().catch(() => false);
    if (hasError) {
      const errorText = await errorElement.textContent();
      console.log('❌ Error message visible:', errorText);
    }

    // Check for session cookie
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c =>
      c.name.includes('next-auth.session-token') ||
      c.name.includes('__Secure-next-auth.session-token')
    );

    if (sessionCookie) {
      console.log('✅ Session cookie found:', sessionCookie.name);
    } else {
      console.log('❌ No session cookie found');
      console.log('Available cookies:', cookies.map(c => c.name));
    }

    // Final assertion
    expect(currentUrl).toContain('/dashboard');
  });
});
