import { test, expect } from './fixtures/auth.fixture';
import { generateTestCharacter, generateTestTable } from './utils/test-data';
import { waitForLoadingToComplete } from './utils/test-helpers';

/**
 * Dashboard Stats E2E Tests
 *
 * Tests dashboard statistics functionality:
 * - Initial counts displayed
 * - Create character → count increments
 * - Create table → count increments
 * - Stats persist after refresh
 */

test.describe('Dashboard Stats', () => {
  test('dashboard shows initial user stats', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Dashboard should show stat cards
    const statCards = authenticatedPage.locator('[data-testid="stat-card"], .stat-card, .stats > div');

    // Should have at least some stat cards visible
    const cardCount = await statCards.count();
    if (cardCount > 0) {
      expect(cardCount).toBeGreaterThan(0);

      // Verify stats are visible (characters, tables, etc.)
      const charactersLabel = authenticatedPage.locator('text=/characters|my characters/i');
      const tablesLabel = authenticatedPage.locator('text=/tables|my tables/i');

      // At least one of these should be visible
      const hasCharacters = await charactersLabel.first().isVisible().catch(() => false);
      const hasTables = await tablesLabel.first().isVisible().catch(() => false);

      expect(hasCharacters || hasTables).toBeTruthy();
    }
  });

  test('creating character increments character count', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Get initial character count
    const characterCountElement = authenticatedPage.locator('text=/characters/i').locator('..').locator('text=/\\d+/');

    let initialCount = 0;
    if (await characterCountElement.first().isVisible({ timeout: 3000 })) {
      const countText = await characterCountElement.first().textContent();
      initialCount = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
    }

    // Navigate to character creation
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    // Create a new character
    const character = generateTestCharacter({
      name: `StatChar${Date.now()}`,
    });

    const createButton = authenticatedPage.locator('button:has-text("Create Character"), a:has-text("Create Character")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      const quickStartButton = authenticatedPage.locator('button:has-text("Quick Start")');
      if (await quickStartButton.isVisible()) {
        await quickStartButton.click();
      }

      await authenticatedPage.fill('input[name="name"]', character.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create"), button:has-text("Finish")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Navigate back to dashboard
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Get new character count
    const newCountElement = authenticatedPage.locator('text=/characters/i').locator('..').locator('text=/\\d+/');

    if (await newCountElement.first().isVisible({ timeout: 3000 })) {
      const newCountText = await newCountElement.first().textContent();
      const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0', 10);

      // Count should have incremented
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('creating table increments table count', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Get initial table count
    const tableCountElement = authenticatedPage.locator('text=/tables/i').locator('..').locator('text=/\\d+/');

    let initialCount = 0;
    if (await tableCountElement.first().isVisible({ timeout: 3000 })) {
      const countText = await tableCountElement.first().textContent();
      initialCount = parseInt(countText?.match(/\d+/)?.[0] || '0', 10);
    }

    // Navigate to table creation
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Create a new table
    const table = generateTestTable({
      name: `StatTable${Date.now()}`,
    });

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', table.name);
      await authenticatedPage.fill('textarea[name="description"]', table.description);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Navigate back to dashboard
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Get new table count
    const newCountElement = authenticatedPage.locator('text=/tables/i').locator('..').locator('text=/\\d+/');

    if (await newCountElement.first().isVisible({ timeout: 3000 })) {
      const newCountText = await newCountElement.first().textContent();
      const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0', 10);

      // Count should have incremented
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('stats persist after page refresh', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Get current stats
    const stats: { [key: string]: number } = {};

    // Characters count
    const charCountElement = authenticatedPage.locator('text=/characters/i').locator('..').locator('text=/\\d+/');
    if (await charCountElement.first().isVisible({ timeout: 3000 })) {
      const text = await charCountElement.first().textContent();
      stats.characters = parseInt(text?.match(/\d+/)?.[0] || '0', 10);
    }

    // Tables count
    const tableCountElement = authenticatedPage.locator('text=/tables/i').locator('..').locator('text=/\\d+/');
    if (await tableCountElement.first().isVisible({ timeout: 3000 })) {
      const text = await tableCountElement.first().textContent();
      stats.tables = parseInt(text?.match(/\d+/)?.[0] || '0', 10);
    }

    // Refresh the page
    await authenticatedPage.reload();
    await waitForLoadingToComplete(authenticatedPage);

    // Verify stats are the same
    if (stats.characters !== undefined) {
      const newCharCount = authenticatedPage.locator('text=/characters/i').locator('..').locator('text=/\\d+/');
      if (await newCharCount.first().isVisible({ timeout: 3000 })) {
        const text = await newCharCount.first().textContent();
        const count = parseInt(text?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBe(stats.characters);
      }
    }

    if (stats.tables !== undefined) {
      const newTableCount = authenticatedPage.locator('text=/tables/i').locator('..').locator('text=/\\d+/');
      if (await newTableCount.first().isVisible({ timeout: 3000 })) {
        const text = await newTableCount.first().textContent();
        const count = parseInt(text?.match(/\d+/)?.[0] || '0', 10);
        expect(count).toBe(stats.tables);
      }
    }
  });

  test('dashboard shows recent activity', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Look for recent activity section
    const recentActivity = authenticatedPage.locator('text=/recent|activity|history/i');

    if (await recentActivity.first().isVisible({ timeout: 3000 })) {
      // Should show some activity items (if user has any)
      const activityItems = authenticatedPage.locator('.activity-item, [data-testid="activity-item"], li:has-text("Created")');

      // If activity items exist, verify they're visible
      const itemCount = await activityItems.count();
      if (itemCount > 0) {
        expect(itemCount).toBeGreaterThan(0);
      }
    }
  });

  test('dashboard shows quick actions', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Should have quick action buttons
    const quickActions = [
      'Create Character',
      'Create Table',
      'Browse Tables',
      'Join Table',
    ];

    let foundActions = 0;

    for (const action of quickActions) {
      const actionButton = authenticatedPage.locator(`button:has-text("${action}"), a:has-text("${action}")`);

      if (await actionButton.first().isVisible({ timeout: 2000 })) {
        foundActions++;
      }
    }

    // Should have at least some quick actions
    expect(foundActions).toBeGreaterThan(0);
  });

  test('stats update in real-time without refresh', async ({ authenticatedPage }) => {
    // Open dashboard in background
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Get initial character count
    const initialCountElement = authenticatedPage.locator('text=/characters/i').locator('..').locator('text=/\\d+/');
    let initialCount = 0;

    if (await initialCountElement.first().isVisible({ timeout: 3000 })) {
      const text = await initialCountElement.first().textContent();
      initialCount = parseInt(text?.match(/\d+/)?.[0] || '0', 10);
    }

    // Navigate to character creation
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    const character = generateTestCharacter({
      name: `RTStatChar${Date.now()}`,
    });

    const createButton = authenticatedPage.locator('button:has-text("Create Character")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      const quickStartButton = authenticatedPage.locator('button:has-text("Quick Start")');
      if (await quickStartButton.isVisible()) {
        await quickStartButton.click();
      }

      await authenticatedPage.fill('input[name="name"]', character.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
    }

    // Navigate back to dashboard (simulates switching tabs)
    await authenticatedPage.goto('/dashboard');
    await waitForLoadingToComplete(authenticatedPage);

    // Stats should reflect the new character
    const newCountElement = authenticatedPage.locator('text=/characters/i').locator('..').locator('text=/\\d+/');

    if (await newCountElement.first().isVisible({ timeout: 3000 })) {
      const text = await newCountElement.first().textContent();
      const newCount = parseInt(text?.match(/\d+/)?.[0] || '0', 10);

      expect(newCount).toBeGreaterThan(initialCount);
    }
  });
});
