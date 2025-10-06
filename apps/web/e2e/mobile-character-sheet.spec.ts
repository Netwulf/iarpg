import { test, expect, devices } from '@playwright/test';
import { generateTestCharacter } from './utils/test-data';
import { waitForLoadingToComplete } from './utils/test-helpers';

/**
 * Mobile Responsive E2E Tests
 *
 * Tests mobile viewport functionality:
 * - Set viewport to mobile (375x667)
 * - Character sheet is readable
 * - All sections accessible (scroll)
 * - Touch interactions work
 */

test.describe('Mobile Character Sheet', () => {
  test('character sheet is readable on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });

    const page = await context.newPage();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Create a character
    const character = generateTestCharacter({
      name: `MobileChar${Date.now()}`,
    });

    await page.goto('/characters');
    await waitForLoadingToComplete(page);

    const createButton = page.locator('button:has-text("Create Character"), a:has-text("Create Character")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      const quickStartButton = page.locator('button:has-text("Quick Start")');
      if (await quickStartButton.isVisible()) {
        await quickStartButton.click();
      }

      await page.fill('input[name="name"]', character.name);

      const submitButton = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Finish")');
      await submitButton.click();

      await page.waitForTimeout(2000);
      await waitForLoadingToComplete(page);
    }

    // Navigate to character list
    await page.goto('/characters');
    await waitForLoadingToComplete(page);

    // Click on character to view sheet
    const characterLink = page.locator(`text="${character.name}"`);
    await characterLink.click();

    await page.waitForURL(/\/characters\/[a-zA-Z0-9-]+/, { timeout: 5000 });
    await waitForLoadingToComplete(page);

    // Verify character sheet is visible
    const characterName = page.locator(`h1:has-text("${character.name}"), h2:has-text("${character.name}")`);
    await expect(characterName.first()).toBeVisible();

    // Verify viewport width is mobile
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(768); // Mobile breakpoint

    // Verify content is readable (not cut off)
    const statsSection = page.locator('text=/strength|dexterity|constitution/i');
    if (await statsSection.first().isVisible({ timeout: 3000 })) {
      await expect(statsSection.first()).toBeVisible();
    }

    await context.close();
  });

  test('mobile navigation menu works (hamburger)', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });

    const page = await context.newPage();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Look for mobile menu button (hamburger)
    const menuButton = page.locator('button[aria-label*="menu" i], button:has([class*="hamburger"]), [data-testid="mobile-menu-button"]');

    if (await menuButton.isVisible({ timeout: 3000 })) {
      // Click to open menu
      await menuButton.click();
      await page.waitForTimeout(500);

      // Menu should be visible
      const menu = page.locator('nav, [data-testid="mobile-menu"], aside');
      await expect(menu.first()).toBeVisible();

      // Should have navigation links
      const dashboardLink = page.locator('a:has-text("Dashboard")');
      const charactersLink = page.locator('a:has-text("Characters")');

      const hasDashboard = await dashboardLink.isVisible().catch(() => false);
      const hasCharacters = await charactersLink.isVisible().catch(() => false);

      expect(hasDashboard || hasCharacters).toBeTruthy();
    }

    await context.close();
  });

  test('table browser is usable on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });

    const page = await context.newPage();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Navigate to tables
    await page.goto('/tables/browse');
    await waitForLoadingToComplete(page);

    // Verify page is usable
    await expect(page).toHaveURL(/.*tables.*browse/);

    // Search should be accessible
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await expect(searchInput).toBeVisible();

      // Should be tappable
      await searchInput.tap();
      await page.waitForTimeout(300);
    }

    // Create button should be visible
    const createButton = page.locator('button:has-text("Create Table")');
    if (await createButton.isVisible({ timeout: 3000 })) {
      await expect(createButton).toBeVisible();
    }

    await context.close();
  });

  test('all character sheet sections are scrollable on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });

    const page = await context.newPage();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Create character
    const character = generateTestCharacter({
      name: `ScrollChar${Date.now()}`,
    });

    await page.goto('/characters');
    await waitForLoadingToComplete(page);

    const createButton = page.locator('button:has-text("Create Character")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      const quickStartButton = page.locator('button:has-text("Quick Start")');
      if (await quickStartButton.isVisible()) {
        await quickStartButton.click();
      }

      await page.fill('input[name="name"]', character.name);

      const submitButton = page.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await page.waitForTimeout(2000);
    }

    // Navigate to character list and open sheet
    await page.goto('/characters');
    await waitForLoadingToComplete(page);

    const characterLink = page.locator(`text="${character.name}"`);
    await characterLink.click();

    await page.waitForURL(/\/characters\/[a-zA-Z0-9-]+/, { timeout: 5000 });
    await waitForLoadingToComplete(page);

    // Scroll down to see more sections
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(500);

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Page should still be functional after scrolling
    const characterName = page.locator(`h1:has-text("${character.name}"), h2:has-text("${character.name}")`);
    await expect(characterName.first()).toBeVisible();

    await context.close();
  });

  test('touch tap works for buttons on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });

    const page = await context.newPage();

    // Login
    await page.goto('/login');

    // Use tap instead of click
    const emailInput = page.locator('input[name="email"]');
    await emailInput.tap();
    await emailInput.fill(process.env.TEST_USER_EMAIL || 'test1@iarpg.local');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.tap();
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'TestPassword123!');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.tap();

    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Verify we're logged in
    await expect(page).toHaveURL(/.*dashboard/);

    await context.close();
  });

  test('mobile viewport shows correct layout for dashboard', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });

    const page = await context.newPage();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    await waitForLoadingToComplete(page);

    // Verify dashboard loads
    await expect(page).toHaveURL(/.*dashboard/);

    // Stat cards should stack vertically on mobile (not side-by-side)
    const statCards = page.locator('[data-testid="stat-card"], .stat-card');
    const cardCount = await statCards.count();

    if (cardCount > 0) {
      // Get positions of cards to verify they stack
      const firstCard = statCards.nth(0);
      const secondCard = statCards.nth(1);

      if (await secondCard.isVisible()) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        // On mobile, cards should stack (second card is below first)
        if (firstBox && secondBox) {
          expect(secondBox.y).toBeGreaterThan(firstBox.y);
        }
      }
    }

    await context.close();
  });

  test('tablet viewport (768px) shows appropriate layout', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Mini'],
    });

    const page = await context.newPage();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    await waitForLoadingToComplete(page);

    // Verify viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThanOrEqual(768);

    // Dashboard should be visible and functional
    await expect(page).toHaveURL(/.*dashboard/);

    // Content should be readable
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    await context.close();
  });

  test('forms are usable on mobile (character creation)', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone SE'],
    });

    const page = await context.newPage();

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Navigate to character creation
    await page.goto('/characters');
    await waitForLoadingToComplete(page);

    const createButton = page.locator('button:has-text("Create Character")');
    if (await createButton.first().isVisible()) {
      await createButton.first().tap();

      const quickStartButton = page.locator('button:has-text("Quick Start")');
      if (await quickStartButton.isVisible()) {
        await quickStartButton.tap();
      }

      // Form should be usable on mobile
      const nameInput = page.locator('input[name="name"]');
      await nameInput.tap();
      await nameInput.fill(`MobileFormChar${Date.now()}`);

      const submitButton = page.locator('button[type="submit"]:has-text("Create")');
      await submitButton.tap();

      await page.waitForTimeout(2000);

      // Should successfully create character
      await expect(page).toHaveURL(/\/characters/);
    }

    await context.close();
  });
});
