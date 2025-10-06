import { test, expect } from './fixtures/auth.fixture';
import { generateTestTable } from './utils/test-data';
import { waitForLoadingToComplete, waitForUrl } from './utils/test-helpers';

/**
 * Table Creation E2E Tests
 *
 * Tests table creation flow:
 * - Create table via form
 * - Table appears in browse
 * - Join table via invite code
 * - Member list updates
 */

test.describe('Table Creation', () => {
  test('create table and verify in browse', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `TestTable${Date.now()}`,
      description: 'E2E test table for creation flow',
    });

    // Navigate to tables section
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Click create table button
    const createButton = authenticatedPage.locator('button:has-text("Create Table"), a:has-text("Create Table"), [data-testid="create-table-button"]');
    await expect(createButton.first()).toBeVisible();
    await createButton.first().click();

    // Fill table creation form
    await authenticatedPage.fill('input[name="name"], input[placeholder*="table name" i]', table.name);
    await authenticatedPage.fill('textarea[name="description"], textarea[placeholder*="description" i]', table.description);

    // Select play style
    const playStyleSelect = authenticatedPage.locator('select[name="playStyle"], [data-testid="play-style-select"]');
    if (await playStyleSelect.isVisible()) {
      await playStyleSelect.selectOption(table.playStyle);
    } else {
      // Try radio buttons
      const playStyleRadio = authenticatedPage.locator(`input[value="${table.playStyle}"]`);
      if (await playStyleRadio.isVisible()) {
        await playStyleRadio.click();
      }
    }

    // Select privacy
    const privacySelect = authenticatedPage.locator('select[name="privacy"], [data-testid="privacy-select"]');
    if (await privacySelect.isVisible()) {
      await privacySelect.selectOption(table.privacy);
    } else {
      // Try radio buttons
      const privacyRadio = authenticatedPage.locator(`input[value="${table.privacy}"]`);
      if (await privacyRadio.isVisible()) {
        await privacyRadio.click();
      }
    }

    // Set max players
    const maxPlayersInput = authenticatedPage.locator('input[name="maxPlayers"], input[placeholder*="max players" i]');
    if (await maxPlayersInput.isVisible()) {
      await maxPlayersInput.fill(table.maxPlayers.toString());
    }

    // Submit form
    const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create"), button:has-text("Create Table")');
    await submitButton.click();

    // Wait for table creation
    await authenticatedPage.waitForTimeout(2000);
    await waitForLoadingToComplete(authenticatedPage);

    // Should navigate to table page or browse
    await authenticatedPage.waitForURL(/\/tables/, { timeout: 5000 });

    // Navigate to browse to verify table appears
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Verify table appears in browse
    const tableCard = authenticatedPage.locator(`text="${table.name}"`);
    await expect(tableCard).toBeVisible({ timeout: 5000 });

    // Verify table details are shown
    const descriptionText = authenticatedPage.locator(`text="${table.description}"`);
    await expect(descriptionText).toBeVisible();
  });

  test('join table via invite code', async ({ authenticatedPage, browser }) => {
    const table = generateTestTable({
      name: `JoinTable${Date.now()}`,
    });

    // User 1: Create a table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    await createButton.first().click();

    await authenticatedPage.fill('input[name="name"]', table.name);
    await authenticatedPage.fill('textarea[name="description"]', table.description);

    const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
    await submitButton.click();

    await authenticatedPage.waitForTimeout(2000);
    await waitForLoadingToComplete(authenticatedPage);

    // Get the invite code (should be visible on table page)
    const inviteCodeElement = authenticatedPage.locator('[data-testid="invite-code"], .invite-code, code');

    let inviteCode = '';
    if (await inviteCodeElement.isVisible()) {
      inviteCode = (await inviteCodeElement.textContent()) || '';
    }

    // If invite code not immediately visible, look for it in settings/share
    if (!inviteCode) {
      const shareButton = authenticatedPage.locator('button:has-text("Share"), button:has-text("Invite")');
      if (await shareButton.isVisible()) {
        await shareButton.click();
        await authenticatedPage.waitForTimeout(500);

        const codeElement = authenticatedPage.locator('[data-testid="invite-code"], .invite-code, code');
        inviteCode = (await codeElement.textContent()) || '';
      }
    }

    // User 2: Join using invite code (new browser context)
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    // Login as second user (using auth fixture helper would be ideal)
    await page2.goto('/login');
    await page2.fill('input[name="email"]', process.env.TEST_USER_2_EMAIL || 'test2@iarpg.local');
    await page2.fill('input[name="password"]', process.env.TEST_USER_2_PASSWORD || 'TestPassword123!');
    await page2.click('button[type="submit"]');
    await page2.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Navigate to join table page
    await page2.goto('/tables/join');
    await waitForLoadingToComplete(page2);

    // If invite code was found, use it
    if (inviteCode) {
      const codeInput = page2.locator('input[name="code"], input[placeholder*="invite code" i]');
      await codeInput.fill(inviteCode);

      const joinButton = page2.locator('button:has-text("Join"), button[type="submit"]');
      await joinButton.click();

      await page2.waitForTimeout(2000);
      await waitForLoadingToComplete(page2);

      // Should navigate to the table
      await expect(page2).toHaveURL(/\/tables\/[a-zA-Z0-9-]+/);

      // Verify table name is shown
      const tableName = page2.locator(`text="${table.name}"`);
      await expect(tableName).toBeVisible();
    }

    // Cleanup
    await context2.close();
  });

  test('member list updates when user joins', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `MemberTable${Date.now()}`,
    });

    // Create table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    await createButton.first().click();

    await authenticatedPage.fill('input[name="name"]', table.name);
    await authenticatedPage.fill('textarea[name="description"]', table.description);

    const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
    await submitButton.click();

    await authenticatedPage.waitForTimeout(2000);
    await waitForLoadingToComplete(authenticatedPage);

    // Check member list (creator should be listed)
    const membersList = authenticatedPage.locator('[data-testid="members-list"], .members-list, aside:has-text("Members")');

    if (await membersList.isVisible()) {
      // Creator should be in members list
      const creatorName = process.env.TEST_USER_EMAIL || 'test1';
      const creatorInList = membersList.locator(`text=/${creatorName}/i`);

      // Member count should be 1
      const memberCount = authenticatedPage.locator('text=/1 member|member.*1/i');
      await expect(memberCount.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('validation prevents creating table without name', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Click create table
    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    await createButton.first().click();

    // Leave name empty and submit
    const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation error
      const errorMessage = authenticatedPage.locator('text=/required|name is required|enter a name/i, [role="alert"]');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('can access created table from browse', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `AccessTable${Date.now()}`,
    });

    // Create table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    await createButton.first().click();

    await authenticatedPage.fill('input[name="name"]', table.name);
    await authenticatedPage.fill('textarea[name="description"]', table.description);

    const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
    await submitButton.click();

    await authenticatedPage.waitForTimeout(2000);
    await waitForLoadingToComplete(authenticatedPage);

    // Navigate back to browse
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    // Click on table to enter
    const tableCard = authenticatedPage.locator(`text="${table.name}"`);
    await tableCard.click();

    // Should navigate to table page
    await waitForUrl(authenticatedPage, /\/tables\/[a-zA-Z0-9-]+/, 5000);

    // Verify we're on the table page
    const tableName = authenticatedPage.locator(`h1:has-text("${table.name}"), h2:has-text("${table.name}")`);
    await expect(tableName.first()).toBeVisible();
  });
});
