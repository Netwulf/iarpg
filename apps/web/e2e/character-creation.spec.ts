import { test, expect } from './fixtures/auth.fixture';
import { generateTestCharacter } from './utils/test-data';
import { waitForLoadingToComplete, waitForUrl } from './utils/test-helpers';

/**
 * Character Creation E2E Tests
 *
 * Tests both character creation flows:
 * - Quick start (minimal input)
 * - Guided flow (7-step wizard)
 * - Character appears in list
 * - Validation errors
 */

test.describe('Character Creation', () => {
  test('quick start character creation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    // Click create character button
    const createButton = authenticatedPage.locator('button:has-text("Create Character"), a:has-text("Create Character"), [data-testid="create-character-button"]');
    await expect(createButton.first()).toBeVisible();
    await createButton.first().click();

    // Should show quick start option
    const quickStartButton = authenticatedPage.locator('button:has-text("Quick Start"), [data-testid="quick-start-button"]');

    if (await quickStartButton.isVisible()) {
      await quickStartButton.click();
    }

    // Generate test character data
    const character = generateTestCharacter({
      name: `QuickChar${Date.now()}`,
    });

    // Fill quick start form
    await authenticatedPage.fill('input[name="name"], input[placeholder*="name" i]', character.name);

    // Select class (if available)
    const classSelect = authenticatedPage.locator('select[name="class"], [data-testid="class-select"]');
    if (await classSelect.isVisible()) {
      await classSelect.selectOption(character.class);
    }

    // Select race (if available)
    const raceSelect = authenticatedPage.locator('select[name="race"], [data-testid="race-select"]');
    if (await raceSelect.isVisible()) {
      await raceSelect.selectOption(character.race);
    }

    // Submit the form
    const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create"), button:has-text("Finish"), button:has-text("Complete")');
    await submitButton.click();

    // Wait for character to be created (might redirect to character sheet or list)
    await authenticatedPage.waitForTimeout(2000);
    await waitForLoadingToComplete(authenticatedPage);

    // Should either be on character sheet or characters list
    const currentUrl = authenticatedPage.url();
    const isCharacterSheetOrList = /\/characters/.test(currentUrl);
    expect(isCharacterSheetOrList).toBeTruthy();

    // Navigate to characters list to verify
    if (!currentUrl.includes('/characters') || currentUrl.includes('/characters/')) {
      await authenticatedPage.goto('/characters');
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Verify character appears in the list
    const characterCard = authenticatedPage.locator(`text="${character.name}"`);
    await expect(characterCard).toBeVisible({ timeout: 5000 });
  });

  test('guided character creation (7 steps)', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    // Click create character
    const createButton = authenticatedPage.locator('button:has-text("Create Character"), a:has-text("Create Character")');
    await createButton.first().click();

    // Select guided flow
    const guidedButton = authenticatedPage.locator('button:has-text("Guided"), [data-testid="guided-flow-button"]');

    if (await guidedButton.isVisible()) {
      await guidedButton.click();
    }

    const character = generateTestCharacter({
      name: `GuidedChar${Date.now()}`,
    });

    // Step 1: Basic Info (Name)
    await authenticatedPage.fill('input[name="name"], input[placeholder*="name" i]', character.name);

    // Check for next button
    let nextButton = authenticatedPage.locator('button:has-text("Next"), button:has-text("Continue")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await authenticatedPage.waitForTimeout(500);
    }

    // Step 2: Race selection
    const raceOptions = authenticatedPage.locator(`button:has-text("${character.race}"), [data-value="${character.race}"]`);
    if (await raceOptions.first().isVisible()) {
      await raceOptions.first().click();
      nextButton = authenticatedPage.locator('button:has-text("Next"), button:has-text("Continue")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await authenticatedPage.waitForTimeout(500);
      }
    }

    // Step 3: Class selection
    const classOptions = authenticatedPage.locator(`button:has-text("${character.class}"), [data-value="${character.class}"]`);
    if (await classOptions.first().isVisible()) {
      await classOptions.first().click();
      nextButton = authenticatedPage.locator('button:has-text("Next"), button:has-text("Continue")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await authenticatedPage.waitForTimeout(500);
      }
    }

    // Steps 4-6: Ability scores (if manual entry)
    const abilityInputs = {
      strength: character.strength,
      dexterity: character.dexterity,
      constitution: character.constitution,
      intelligence: character.intelligence,
      wisdom: character.wisdom,
      charisma: character.charisma,
    };

    for (const [ability, value] of Object.entries(abilityInputs)) {
      const input = authenticatedPage.locator(`input[name="${ability}"]`);
      if (await input.isVisible()) {
        await input.fill(value.toString());
      }
    }

    // Move to next step if available
    nextButton = authenticatedPage.locator('button:has-text("Next"), button:has-text("Continue")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await authenticatedPage.waitForTimeout(500);
    }

    // Final step: Submit
    const finishButton = authenticatedPage.locator('button:has-text("Finish"), button:has-text("Create"), button[type="submit"]');
    await finishButton.click();

    // Wait for creation
    await authenticatedPage.waitForTimeout(2000);
    await waitForLoadingToComplete(authenticatedPage);

    // Navigate to characters list
    const currentUrl = authenticatedPage.url();
    if (!currentUrl.includes('/characters') || currentUrl.includes('/characters/')) {
      await authenticatedPage.goto('/characters');
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Verify character appears
    const characterCard = authenticatedPage.locator(`text="${character.name}"`);
    await expect(characterCard).toBeVisible({ timeout: 5000 });
  });

  test('validation prevents creating character without name', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    // Click create character
    const createButton = authenticatedPage.locator('button:has-text("Create Character"), a:has-text("Create Character")');
    await createButton.first().click();

    // Select quick start if prompted
    const quickStartButton = authenticatedPage.locator('button:has-text("Quick Start")');
    if (await quickStartButton.isVisible()) {
      await quickStartButton.click();
    }

    // Leave name empty and try to submit
    const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create"), button:has-text("Finish")');

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation error
      const errorMessage = authenticatedPage.locator('text=/required|name is required|enter a name/i, [role="alert"]');
      await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('created character appears in character list', async ({ authenticatedPage }) => {
    const character = generateTestCharacter({
      name: `ListChar${Date.now()}`,
    });

    // Navigate to characters page
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    // Create character via quick start
    const createButton = authenticatedPage.locator('button:has-text("Create Character"), a:has-text("Create Character")');
    await createButton.first().click();

    const quickStartButton = authenticatedPage.locator('button:has-text("Quick Start")');
    if (await quickStartButton.isVisible()) {
      await quickStartButton.click();
    }

    await authenticatedPage.fill('input[name="name"], input[placeholder*="name" i]', character.name);

    const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create"), button:has-text("Finish")');
    await submitButton.click();

    await authenticatedPage.waitForTimeout(2000);
    await waitForLoadingToComplete(authenticatedPage);

    // Navigate to character list
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    // Verify character is in the list
    const characterCard = authenticatedPage.locator(`text="${character.name}"`);
    await expect(characterCard).toBeVisible();

    // Should have character details (class, level, etc.)
    const characterContainer = characterCard.locator('..').locator('..');
    await expect(characterContainer).toBeVisible();
  });

  test('can view created character details', async ({ authenticatedPage }) => {
    const character = generateTestCharacter({
      name: `ViewChar${Date.now()}`,
    });

    // Create character
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Character")');
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

    // Navigate to list
    await authenticatedPage.goto('/characters');
    await waitForLoadingToComplete(authenticatedPage);

    // Click on character to view details
    const characterLink = authenticatedPage.locator(`text="${character.name}"`);
    await characterLink.click();

    // Should navigate to character sheet
    await waitForUrl(authenticatedPage, /\/characters\/[a-zA-Z0-9-]+/, 5000);

    // Verify character name is shown
    const characterName = authenticatedPage.locator(`h1:has-text("${character.name}"), h2:has-text("${character.name}")`);
    await expect(characterName.first()).toBeVisible();

    // Verify character details are visible (stats, abilities, etc.)
    const statsSection = authenticatedPage.locator('text=/strength|dexterity|constitution/i');
    await expect(statsSection.first()).toBeVisible({ timeout: 5000 });
  });
});
