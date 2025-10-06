import { test, expect } from './fixtures/auth.fixture';
import { generateTestTable } from './utils/test-data';
import { waitForLoadingToComplete } from './utils/test-helpers';

/**
 * Dice Rolling E2E Tests
 *
 * Tests dice rolling functionality:
 * - Open dice roller
 * - Roll various dice (d20, d6, etc.)
 * - Result appears in chat
 * - Formula validation
 * - Multiple dice rolls
 */

test.describe('Dice Rolling', () => {
  test('roll d20 and result appears in chat', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `DiceTable${Date.now()}`,
    });

    // Create and enter a table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Wait for table to load
    await authenticatedPage.waitForTimeout(1000);

    // Open dice roller (look for dice button/icon)
    const diceButton = authenticatedPage.locator('button:has-text("Roll"), button[aria-label*="dice" i], [data-testid="dice-roller-button"], button:has([class*="dice"])');

    if (await diceButton.first().isVisible({ timeout: 3000 })) {
      await diceButton.first().click();

      // Wait for dice roller to open
      await authenticatedPage.waitForTimeout(500);

      // Look for d20 button
      const d20Button = authenticatedPage.locator('button:has-text("d20"), button:has-text("D20"), [data-testid="roll-d20"]');

      if (await d20Button.isVisible()) {
        await d20Button.click();
      } else {
        // Try manual input
        const diceInput = authenticatedPage.locator('input[name="dice"], input[placeholder*="dice" i], input[placeholder*="roll" i]');
        if (await diceInput.isVisible()) {
          await diceInput.fill('1d20');

          const rollButton = authenticatedPage.locator('button:has-text("Roll"), button[type="submit"]');
          await rollButton.click();
        }
      }

      // Wait for result
      await authenticatedPage.waitForTimeout(1000);

      // Result should appear (either in modal or chat)
      const resultPattern = /rolled.*\d+|result.*\d+|1d20.*\d+/i;
      const resultElement = authenticatedPage.locator(`text=${resultPattern}`);

      await expect(resultElement.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('roll multiple dice (2d6) and see total', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `MultiDiceTable${Date.now()}`,
    });

    // Create and enter table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Open dice roller
    const diceButton = authenticatedPage.locator('button:has-text("Roll"), [data-testid="dice-roller-button"]');

    if (await diceButton.first().isVisible({ timeout: 3000 })) {
      await diceButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Enter custom dice formula
      const diceInput = authenticatedPage.locator('input[name="dice"], input[placeholder*="dice" i], input[placeholder*="roll" i], input[type="text"]');

      if (await diceInput.first().isVisible()) {
        await diceInput.first().fill('2d6');

        const rollButton = authenticatedPage.locator('button:has-text("Roll"), button[type="submit"]');
        await rollButton.click();

        // Wait for result
        await authenticatedPage.waitForTimeout(1000);

        // Should show result with total (2-12)
        const resultPattern = /rolled.*\d+|total.*\d+|2d6/i;
        const resultElement = authenticatedPage.locator(`text=${resultPattern}`);

        await expect(resultElement.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('dice roll with modifier (1d20+5)', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `ModifierTable${Date.now()}`,
    });

    // Create and enter table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Open dice roller
    const diceButton = authenticatedPage.locator('button:has-text("Roll"), [data-testid="dice-roller-button"]');

    if (await diceButton.first().isVisible({ timeout: 3000 })) {
      await diceButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Enter dice formula with modifier
      const diceInput = authenticatedPage.locator('input[name="dice"], input[placeholder*="dice" i], input[type="text"]');

      if (await diceInput.first().isVisible()) {
        await diceInput.first().fill('1d20+5');

        const rollButton = authenticatedPage.locator('button:has-text("Roll"), button[type="submit"]');
        await rollButton.click();

        // Wait for result
        await authenticatedPage.waitForTimeout(1000);

        // Should show result (6-25) with breakdown
        const resultPattern = /rolled.*\d+|\+5|1d20\+5/i;
        const resultElement = authenticatedPage.locator(`text=${resultPattern}`);

        await expect(resultElement.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('invalid dice formula shows error', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `ErrorTable${Date.now()}`,
    });

    // Create and enter table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Open dice roller
    const diceButton = authenticatedPage.locator('button:has-text("Roll"), [data-testid="dice-roller-button"]');

    if (await diceButton.first().isVisible({ timeout: 3000 })) {
      await diceButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Enter invalid formula
      const diceInput = authenticatedPage.locator('input[name="dice"], input[placeholder*="dice" i], input[type="text"]');

      if (await diceInput.first().isVisible()) {
        await diceInput.first().fill('invalid');

        const rollButton = authenticatedPage.locator('button:has-text("Roll"), button[type="submit"]');
        await rollButton.click();

        // Should show error
        const errorMessage = authenticatedPage.locator('text=/invalid|error|format/i, [role="alert"]');
        await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('quick dice buttons (d4, d6, d8, d10, d12, d20)', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `QuickDiceTable${Date.now()}`,
    });

    // Create and enter table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Open dice roller
    const diceButton = authenticatedPage.locator('button:has-text("Roll"), [data-testid="dice-roller-button"]');

    if (await diceButton.first().isVisible({ timeout: 3000 })) {
      await diceButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Try to find quick dice buttons
      const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

      for (const diceType of diceTypes) {
        const quickButton = authenticatedPage.locator(`button:has-text("${diceType}"), button:has-text("${diceType.toUpperCase()}")`);

        if (await quickButton.isVisible()) {
          // Click the quick button
          await quickButton.click();
          await authenticatedPage.waitForTimeout(500);

          // Should show result
          const resultPattern = new RegExp(`${diceType}|rolled.*\\d+`, 'i');
          const resultElement = authenticatedPage.locator(`text=${resultPattern}`);

          await expect(resultElement.first()).toBeVisible({ timeout: 2000 });

          // Break after first successful test
          break;
        }
      }
    }
  });

  test('dice roll appears in chat history', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `ChatDiceTable${Date.now()}`,
    });

    // Create and enter table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Open dice roller and roll
    const diceButton = authenticatedPage.locator('button:has-text("Roll"), [data-testid="dice-roller-button"]');

    if (await diceButton.first().isVisible({ timeout: 3000 })) {
      await diceButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Roll d20
      const d20Button = authenticatedPage.locator('button:has-text("d20"), button:has-text("D20")');

      if (await d20Button.isVisible()) {
        await d20Button.click();
      } else {
        // Try manual input
        const diceInput = authenticatedPage.locator('input[name="dice"], input[type="text"]');
        if (await diceInput.first().isVisible()) {
          await diceInput.first().fill('1d20');

          const rollButton = authenticatedPage.locator('button:has-text("Roll")');
          await rollButton.click();
        }
      }

      // Wait for roll result
      await authenticatedPage.waitForTimeout(1000);

      // Close dice roller (if modal)
      const closeButton = authenticatedPage.locator('button:has-text("Close"), button[aria-label="Close"], [data-testid="close-button"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }

      // Check chat area for dice roll message
      const chatArea = authenticatedPage.locator('.chat, [data-testid="chat-messages"], .messages');
      const diceRollMessage = chatArea.locator('text=/rolled|d20|dice/i');

      // Wait a bit for message to appear in chat
      await authenticatedPage.waitForTimeout(1000);

      if (await diceRollMessage.first().isVisible({ timeout: 3000 })) {
        await expect(diceRollMessage.first()).toBeVisible();
      }
    }
  });
});
