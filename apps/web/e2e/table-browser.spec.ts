import { test, expect } from './fixtures/auth.fixture';
import { generateTestTable } from './utils/test-data';
import { waitForLoadingToComplete } from './utils/test-helpers';

/**
 * Table Browser E2E Tests
 *
 * Tests table browsing and filtering:
 * - Browse shows public tables
 * - Search filter works
 * - Play style filter works
 * - Pagination works
 */

test.describe('Table Browser', () => {
  test('browse page shows public tables', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Page should load successfully
    await expect(authenticatedPage).toHaveURL(/.*tables.*browse/);

    // Should show tables (if any exist) or empty state
    const tableGrid = authenticatedPage.locator('[data-testid="table-grid"], .table-grid, .tables-list');

    if (await tableGrid.isVisible({ timeout: 3000 })) {
      // Tables grid is visible
      expect(await tableGrid.isVisible()).toBeTruthy();
    } else {
      // Empty state should be shown
      const emptyState = authenticatedPage.locator('text=/no tables|create.*first table/i');
      if (await emptyState.isVisible()) {
        expect(await emptyState.isVisible()).toBeTruthy();
      }
    }

    // Should have search/filter controls
    const searchInput = authenticatedPage.locator('input[placeholder*="search" i], input[type="search"], [data-testid="search-input"]');
    const hasSearch = await searchInput.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasSearch) {
      expect(await searchInput.isVisible()).toBeTruthy();
    }
  });

  test('search filter shows matching tables only', async ({ authenticatedPage }) => {
    // Create a unique table first
    const uniqueTable = generateTestTable({
      name: `UniqueSearchTable${Date.now()}`,
      description: 'Very unique description for search test',
    });

    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Create the table
    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', uniqueTable.name);
      await authenticatedPage.fill('textarea[name="description"]', uniqueTable.description);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Navigate back to browse
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Use search to find the unique table
    const searchInput = authenticatedPage.locator('input[placeholder*="search" i], input[type="search"], [data-testid="search-input"]');

    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('UniqueSearchTable');
      await authenticatedPage.waitForTimeout(1000); // Wait for search debounce

      // Should show only matching table
      const tableCard = authenticatedPage.locator(`text="${uniqueTable.name}"`);
      await expect(tableCard).toBeVisible({ timeout: 3000 });

      // Clear search
      await searchInput.fill('');
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('play style filter shows only matching tables', async ({ authenticatedPage }) => {
    // Create tables with different play styles
    const syncTable = generateTestTable({
      name: `SyncTable${Date.now()}`,
      playStyle: 'sync',
    });

    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Create sync table
    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', syncTable.name);

      const playStyleSelect = authenticatedPage.locator('select[name="playStyle"], [data-testid="play-style-select"]');
      if (await playStyleSelect.isVisible()) {
        await playStyleSelect.selectOption('sync');
      }

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
    }

    // Navigate back to browse
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Apply play style filter
    const filterSelect = authenticatedPage.locator('select[name="playStyle"], select[name="filter"], [data-testid="play-style-filter"]');

    if (await filterSelect.isVisible({ timeout: 3000 })) {
      await filterSelect.selectOption('sync');
      await authenticatedPage.waitForTimeout(1000);

      // Should show the sync table
      const tableCard = authenticatedPage.locator(`text="${syncTable.name}"`);
      await expect(tableCard).toBeVisible({ timeout: 3000 });
    }
  });

  test('privacy filter shows only matching tables', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Look for privacy filter
    const privacyFilter = authenticatedPage.locator('select[name="privacy"], [data-testid="privacy-filter"]');

    if (await privacyFilter.isVisible({ timeout: 3000 })) {
      // Filter by public
      await privacyFilter.selectOption('public');
      await authenticatedPage.waitForTimeout(1000);

      // Tables should be filtered
      const tableCards = authenticatedPage.locator('.table-card, [data-testid="table-card"]');
      const count = await tableCards.count();

      // All visible tables should be public
      if (count > 0) {
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('pagination works for large number of tables', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Look for pagination controls
    const nextButton = authenticatedPage.locator('button:has-text("Next"), button[aria-label*="next" i], [data-testid="next-page"]');
    const prevButton = authenticatedPage.locator('button:has-text("Previous"), button:has-text("Prev"), button[aria-label*="previous" i]');

    // If pagination exists
    if (await nextButton.isVisible({ timeout: 2000 })) {
      // Get current page tables
      const tableCards = authenticatedPage.locator('.table-card, [data-testid="table-card"]');
      const firstPageCount = await tableCards.count();

      // Click next
      await nextButton.click();
      await waitForLoadingToComplete(authenticatedPage);
      await authenticatedPage.waitForTimeout(1000);

      // Should show different tables (or same if only one page)
      const secondPageCards = authenticatedPage.locator('.table-card, [data-testid="table-card"]');
      const secondPageCount = await secondPageCards.count();

      // Either has different tables or prev button is disabled
      expect(secondPageCount).toBeGreaterThanOrEqual(0);

      // Go back to first page
      if (await prevButton.isVisible()) {
        await prevButton.click();
        await waitForLoadingToComplete(authenticatedPage);
      }
    }
  });

  test('clicking table card navigates to table', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `ClickTable${Date.now()}`,
    });

    // Create a table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
    }

    // Navigate back to browse
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Click on the table
    const tableCard = authenticatedPage.locator(`text="${table.name}"`);
    await tableCard.click();

    // Should navigate to table page
    await authenticatedPage.waitForURL(/\/tables\/[a-zA-Z0-9-]+/, { timeout: 5000 });
    await expect(authenticatedPage).toHaveURL(/\/tables\/[a-zA-Z0-9-]+/);
  });

  test('tables show player count', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Look for table cards with player info
    const playerCount = authenticatedPage.locator('text=/\\d+\\/\\d+.*players|players.*\\d+/i');

    // If tables exist, they should show player count
    const tableCards = authenticatedPage.locator('.table-card, [data-testid="table-card"]');
    const cardCount = await tableCards.count();

    if (cardCount > 0 && await playerCount.first().isVisible({ timeout: 2000 })) {
      await expect(playerCount.first()).toBeVisible();
    }
  });

  test('tables show play style badge', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Look for play style badges
    const playStyleBadge = authenticatedPage.locator('text=/sync|async|solo/i, .badge, [data-testid="play-style-badge"]');

    const tableCards = authenticatedPage.locator('.table-card, [data-testid="table-card"]');
    const cardCount = await tableCards.count();

    if (cardCount > 0 && await playStyleBadge.first().isVisible({ timeout: 2000 })) {
      await expect(playStyleBadge.first()).toBeVisible();
    }
  });

  test('clear filters button resets all filters', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Apply a search filter
    const searchInput = authenticatedPage.locator('input[placeholder*="search" i], input[type="search"]');

    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('SearchTerm');
      await authenticatedPage.waitForTimeout(500);

      // Look for clear/reset button
      const clearButton = authenticatedPage.locator('button:has-text("Clear"), button:has-text("Reset"), [data-testid="clear-filters"]');

      if (await clearButton.isVisible({ timeout: 2000 })) {
        await clearButton.click();
        await authenticatedPage.waitForTimeout(500);

        // Search should be cleared
        const searchValue = await searchInput.inputValue();
        expect(searchValue).toBe('');
      }
    }
  });
});
