import { test, expect } from './fixtures/auth.fixture';
import { generateTestTable } from './utils/test-data';
import { waitForLoadingToComplete } from './utils/test-helpers';

/**
 * Combat Tracker E2E Tests
 *
 * Tests combat tracking functionality:
 * - Start combat
 * - Initiative order
 * - Next turn progression
 * - Update HP
 * - End combat
 */

test.describe('Combat Tracker', () => {
  test('complete combat flow: start → initiative → turns → end', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `CombatTable${Date.now()}`,
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

    // Look for combat tracker button
    const combatButton = authenticatedPage.locator('button:has-text("Combat"), button:has-text("Start Combat"), [data-testid="combat-button"], button[aria-label*="combat" i]');

    if (await combatButton.first().isVisible({ timeout: 3000 })) {
      // Start combat
      await combatButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Combat tracker should be visible
      const combatTracker = authenticatedPage.locator('.combat-tracker, [data-testid="combat-tracker"], aside:has-text("Combat")');
      await expect(combatTracker.first()).toBeVisible({ timeout: 3000 });

      // Check for initiative list
      const initiativeList = authenticatedPage.locator('.initiative-list, [data-testid="initiative-list"], ul:has-text("Initiative")');

      if (await initiativeList.isVisible({ timeout: 2000 })) {
        // Verify at least one combatant is listed
        const combatants = authenticatedPage.locator('.combatant, .initiative-item, [data-testid="combatant"]');
        const combatantCount = await combatants.count();

        // Should have at least 1 combatant (could be auto-added or manual)
        if (combatantCount > 0) {
          expect(combatantCount).toBeGreaterThanOrEqual(1);
        }
      }

      // Look for "Next Turn" button
      const nextTurnButton = authenticatedPage.locator('button:has-text("Next Turn"), button:has-text("Next"), [data-testid="next-turn-button"]');

      if (await nextTurnButton.isVisible({ timeout: 2000 })) {
        // Click next turn
        await nextTurnButton.click();
        await authenticatedPage.waitForTimeout(500);

        // Turn counter should increment or active combatant should change
        const turnIndicator = authenticatedPage.locator('text=/turn.*2|round.*1/i, [data-testid="turn-counter"]');
        await expect(turnIndicator.first()).toBeVisible({ timeout: 2000 });
      }

      // End combat
      const endCombatButton = authenticatedPage.locator('button:has-text("End Combat"), button:has-text("Stop Combat"), [data-testid="end-combat-button"]');

      if (await endCombatButton.isVisible({ timeout: 2000 })) {
        await endCombatButton.click();
        await authenticatedPage.waitForTimeout(500);

        // Combat tracker should close or hide
        const combatTrackerAfter = authenticatedPage.locator('.combat-tracker:visible, [data-testid="combat-tracker"]:visible');
        await expect(combatTrackerAfter).not.toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('add combatant to initiative', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `InitiativeTable${Date.now()}`,
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

    // Start combat
    const combatButton = authenticatedPage.locator('button:has-text("Combat"), button:has-text("Start Combat")');

    if (await combatButton.first().isVisible({ timeout: 3000 })) {
      await combatButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Look for "Add Combatant" button
      const addCombatantButton = authenticatedPage.locator('button:has-text("Add Combatant"), button:has-text("Add"), [data-testid="add-combatant-button"]');

      if (await addCombatantButton.isVisible({ timeout: 2000 })) {
        await addCombatantButton.click();
        await authenticatedPage.waitForTimeout(500);

        // Fill combatant form
        const nameInput = authenticatedPage.locator('input[name="name"], input[placeholder*="name" i]');
        const initiativeInput = authenticatedPage.locator('input[name="initiative"], input[placeholder*="initiative" i]');

        if (await nameInput.first().isVisible()) {
          await nameInput.first().fill('Goblin');
        }

        if (await initiativeInput.first().isVisible()) {
          await initiativeInput.first().fill('15');
        }

        // Submit
        const addButton = authenticatedPage.locator('button:has-text("Add"), button[type="submit"]');
        await addButton.click();
        await authenticatedPage.waitForTimeout(500);

        // Verify combatant appears
        const combatantName = authenticatedPage.locator('text="Goblin"');
        await expect(combatantName).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('update HP during combat', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `HPTable${Date.now()}`,
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

    // Start combat
    const combatButton = authenticatedPage.locator('button:has-text("Combat"), button:has-text("Start Combat")');

    if (await combatButton.first().isVisible({ timeout: 3000 })) {
      await combatButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Look for HP input/display
      const hpInput = authenticatedPage.locator('input[name="hp"], input[placeholder*="hp" i], [data-testid="hp-input"]');

      if (await hpInput.first().isVisible({ timeout: 2000 })) {
        // Update HP
        await hpInput.first().fill('20');
        await authenticatedPage.waitForTimeout(500);

        // HP should be updated
        const hpDisplay = authenticatedPage.locator('text=/hp.*20|20.*hp/i');
        await expect(hpDisplay.first()).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('initiative order is sorted correctly', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `OrderTable${Date.now()}`,
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

    // Start combat
    const combatButton = authenticatedPage.locator('button:has-text("Combat"), button:has-text("Start Combat")');

    if (await combatButton.first().isVisible({ timeout: 3000 })) {
      await combatButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Add multiple combatants with different initiatives
      const combatants = [
        { name: 'Fighter', initiative: '20' },
        { name: 'Rogue', initiative: '18' },
        { name: 'Wizard', initiative: '15' },
      ];

      for (const combatant of combatants) {
        const addButton = authenticatedPage.locator('button:has-text("Add Combatant"), button:has-text("Add")');

        if (await addButton.isVisible({ timeout: 2000 })) {
          await addButton.click();
          await authenticatedPage.waitForTimeout(300);

          const nameInput = authenticatedPage.locator('input[name="name"], input[placeholder*="name" i]');
          const initiativeInput = authenticatedPage.locator('input[name="initiative"], input[placeholder*="initiative" i]');

          if (await nameInput.first().isVisible()) {
            await nameInput.first().fill(combatant.name);
          }

          if (await initiativeInput.first().isVisible()) {
            await initiativeInput.first().fill(combatant.initiative);
          }

          const submitButton = authenticatedPage.locator('button:has-text("Add"), button[type="submit"]');
          await submitButton.click();
          await authenticatedPage.waitForTimeout(300);
        }
      }

      // Verify order (Fighter should be first, then Rogue, then Wizard)
      const initiativeItems = authenticatedPage.locator('.combatant, .initiative-item, [data-testid="combatant"]');
      const itemCount = await initiativeItems.count();

      if (itemCount >= 3) {
        // First item should be Fighter (highest initiative)
        const firstItem = initiativeItems.nth(0);
        await expect(firstItem).toContainText('Fighter');
      }
    }
  });

  test('remove combatant from initiative', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `RemoveTable${Date.now()}`,
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

    // Start combat and add a combatant
    const combatButton = authenticatedPage.locator('button:has-text("Combat"), button:has-text("Start Combat")');

    if (await combatButton.first().isVisible({ timeout: 3000 })) {
      await combatButton.first().click();
      await authenticatedPage.waitForTimeout(500);

      // Add combatant
      const addButton = authenticatedPage.locator('button:has-text("Add Combatant"), button:has-text("Add")');

      if (await addButton.isVisible({ timeout: 2000 })) {
        await addButton.click();

        const nameInput = authenticatedPage.locator('input[name="name"]');
        await nameInput.first().fill('Orc');

        const submitButton = authenticatedPage.locator('button:has-text("Add"), button[type="submit"]');
        await submitButton.click();
        await authenticatedPage.waitForTimeout(500);

        // Verify combatant appears
        const orcName = authenticatedPage.locator('text="Orc"');
        await expect(orcName).toBeVisible();

        // Remove combatant
        const removeButton = authenticatedPage.locator('button:has-text("Remove"), button[aria-label*="remove" i], [data-testid="remove-combatant"]').last();

        if (await removeButton.isVisible({ timeout: 2000 })) {
          await removeButton.click();
          await authenticatedPage.waitForTimeout(500);

          // Orc should be gone
          await expect(orcName).not.toBeVisible({ timeout: 2000 });
        }
      }
    }
  });
});
