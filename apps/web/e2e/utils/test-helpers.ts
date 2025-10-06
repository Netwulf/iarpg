import { Page, expect } from '@playwright/test';

/**
 * Test Helpers - Common utilities for E2E tests
 */

/**
 * Wait for an element to be visible and clickable
 */
export async function waitAndClick(page: Page, selector: string, timeout = 5000) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  await element.click();
}

/**
 * Fill a form field with value
 */
export async function fillField(page: Page, selector: string, value: string) {
  await page.fill(selector, value);
}

/**
 * Navigate and wait for page load
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for toast/notification to appear
 */
export async function waitForToast(page: Page, message: string, timeout = 5000) {
  const toast = page.locator('.toast, [role="alert"]').filter({ hasText: message });
  await toast.waitFor({ state: 'visible', timeout });
}

/**
 * Wait for loading state to disappear
 */
export async function waitForLoadingToComplete(page: Page, timeout = 10000) {
  const loadingIndicators = [
    'text=Loading...',
    '[data-testid="loading-spinner"]',
    '.spinner',
    '.loading'
  ];

  for (const selector of loadingIndicators) {
    const element = page.locator(selector);
    if (await element.isVisible()) {
      await element.waitFor({ state: 'hidden', timeout });
    }
  }
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Get text content from an element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  return (await page.locator(selector).textContent()) || '';
}

/**
 * Check if element exists (without waiting)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return (await page.locator(selector).count()) > 0;
}

/**
 * Wait for URL to match pattern
 */
export async function waitForUrl(page: Page, urlPattern: string | RegExp, timeout = 5000) {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Take a screenshot with custom name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp, timeout = 10000) {
  return page.waitForResponse(response => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  }, { timeout });
}

/**
 * Simulate network conditions (slow 3G, offline, etc.)
 */
export async function setNetworkConditions(page: Page, condition: 'slow3g' | 'offline' | 'online') {
  const context = page.context();

  if (condition === 'offline') {
    await context.setOffline(true);
  } else if (condition === 'online') {
    await context.setOffline(false);
  } else if (condition === 'slow3g') {
    await context.setOffline(false);
    // Playwright doesn't support network throttling directly
    // This would need CDP (Chrome DevTools Protocol) for full support
  }
}

/**
 * Clear browser storage (cookies, localStorage, sessionStorage)
 */
export async function clearBrowserStorage(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Set localStorage item
 */
export async function setLocalStorageItem(page: Page, key: string, value: string) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
  }, { key, value });
}

/**
 * Get localStorage item
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  return page.evaluate((key) => {
    return localStorage.getItem(key);
  }, key);
}
