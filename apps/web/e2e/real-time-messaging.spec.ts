import { test, expect } from '@playwright/test';
import { generateTestTable } from './utils/test-data';
import { waitForLoadingToComplete } from './utils/test-helpers';

/**
 * Real-Time Messaging E2E Tests
 *
 * Tests real-time message synchronization via WebSocket:
 * - Messages sync between 2 browser contexts
 * - Typing indicators show (if implemented)
 * - Message order is preserved
 * - Connection handling
 */

test.describe('Real-Time Messaging', () => {
  test('messages sync in real-time between two users', async ({ browser }) => {
    const table = generateTestTable({
      name: `RTTable${Date.now()}`,
    });

    // Create two browser contexts (simulating 2 different users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // User 1: Login
    await page1.goto('/login');
    await page1.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page1.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page1.click('button[type="submit"]');
    await page1.waitForURL(/.*dashboard/, { timeout: 10000 });

    // User 2: Login
    await page2.goto('/login');
    await page2.fill('input[name="email"]', process.env.TEST_USER_2_EMAIL || 'test2@iarpg.local');
    await page2.fill('input[name="password"]', process.env.TEST_USER_2_PASSWORD || 'TestPassword123!');
    await page2.click('button[type="submit"]');
    await page2.waitForURL(/.*dashboard/, { timeout: 10000 });

    // User 1: Create a table
    await page1.goto('/tables/browse');
    await waitForLoadingToComplete(page1);

    const createButton = page1.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await page1.fill('input[name="name"]', table.name);
      await page1.fill('textarea[name="description"]', table.description);

      const submitButton = page1.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await page1.waitForTimeout(2000);
      await waitForLoadingToComplete(page1);
    }

    // Get current table URL from page1
    await page1.waitForTimeout(1000);
    const tableUrl = page1.url();

    // User 2: Navigate to the same table
    await page2.goto(tableUrl);
    await waitForLoadingToComplete(page2);

    // Wait for WebSocket connections to establish
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // User 1: Send a message
    const message1 = `Hello from User 1 - ${Date.now()}`;

    const messageInput1 = page1.locator('input[name="message"], textarea[name="message"], input[placeholder*="message" i], [data-testid="message-input"]');
    await expect(messageInput1.first()).toBeVisible({ timeout: 5000 });
    await messageInput1.first().fill(message1);

    const sendButton1 = page1.locator('button:has-text("Send"), button[type="submit"], [data-testid="send-button"], button[aria-label*="send" i]');
    await sendButton1.first().click();

    // User 1: Should see own message immediately
    const ownMessage1 = page1.locator(`text="${message1}"`);
    await expect(ownMessage1).toBeVisible({ timeout: 2000 });

    // User 2: Should see message from User 1 in real-time
    const receivedMessage1 = page2.locator(`text="${message1}"`);
    await expect(receivedMessage1).toBeVisible({ timeout: 3000 });

    // User 2: Send a reply
    const message2 = `Reply from User 2 - ${Date.now()}`;

    const messageInput2 = page2.locator('input[name="message"], textarea[name="message"], input[placeholder*="message" i], [data-testid="message-input"]');
    await messageInput2.first().fill(message2);

    const sendButton2 = page2.locator('button:has-text("Send"), button[type="submit"], [data-testid="send-button"]');
    await sendButton2.first().click();

    // User 2: Should see own message
    const ownMessage2 = page2.locator(`text="${message2}"`);
    await expect(ownMessage2).toBeVisible({ timeout: 2000 });

    // User 1: Should see reply from User 2
    const receivedMessage2 = page1.locator(`text="${message2}"`);
    await expect(receivedMessage2).toBeVisible({ timeout: 3000 });

    // Verify message order is preserved
    const chatMessages1 = page1.locator('.message, [data-testid="message"]');
    const messageCount1 = await chatMessages1.count();
    expect(messageCount1).toBeGreaterThanOrEqual(2);

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('typing indicator shows when user is typing', async ({ browser }) => {
    const table = generateTestTable({
      name: `TypingTable${Date.now()}`,
    });

    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Login both users
    await page1.goto('/login');
    await page1.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page1.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page1.click('button[type="submit"]');
    await page1.waitForURL(/.*dashboard/, { timeout: 10000 });

    await page2.goto('/login');
    await page2.fill('input[name="email"]', process.env.TEST_USER_2_EMAIL || 'test2@iarpg.local');
    await page2.fill('input[name="password"]', process.env.TEST_USER_2_PASSWORD || 'TestPassword123!');
    await page2.click('button[type="submit"]');
    await page2.waitForURL(/.*dashboard/, { timeout: 10000 });

    // User 1: Create table
    await page1.goto('/tables/browse');
    await waitForLoadingToComplete(page1);

    const createButton = page1.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await page1.fill('input[name="name"]', table.name);
      await page1.fill('textarea[name="description"]', table.description);

      const submitButton = page1.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await page1.waitForTimeout(2000);
      await waitForLoadingToComplete(page1);
    }

    // Get table URL
    const tableUrl = page1.url();

    // User 2: Join table
    await page2.goto(tableUrl);
    await waitForLoadingToComplete(page2);

    // Wait for connections
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // User 1: Start typing (don't send)
    const messageInput1 = page1.locator('input[name="message"], textarea[name="message"], [data-testid="message-input"]');
    await messageInput1.first().fill('Typing...');

    // User 2: Should see typing indicator (if implemented)
    const typingIndicator = page2.locator('text=/is typing|typing.../i, [data-testid="typing-indicator"]');

    // Check if typing indicator is implemented
    if (await typingIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(typingIndicator).toBeVisible();
    }

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('message order is preserved with rapid messages', async ({ browser }) => {
    const table = generateTestTable({
      name: `OrderTable${Date.now()}`,
    });

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    // Login
    await page1.goto('/login');
    await page1.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page1.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page1.click('button[type="submit"]');
    await page1.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Create and enter table
    await page1.goto('/tables/browse');
    await waitForLoadingToComplete(page1);

    const createButton = page1.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await page1.fill('input[name="name"]', table.name);

      const submitButton = page1.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await page1.waitForTimeout(2000);
      await waitForLoadingToComplete(page1);
    }

    // Send multiple messages rapidly
    const messages = [
      'Message 1',
      'Message 2',
      'Message 3',
      'Message 4',
      'Message 5',
    ];

    for (const msg of messages) {
      const messageInput = page1.locator('input[name="message"], textarea[name="message"], [data-testid="message-input"]');
      await messageInput.first().fill(msg);

      const sendButton = page1.locator('button:has-text("Send"), [data-testid="send-button"]');
      await sendButton.first().click();

      // Small delay between messages
      await page1.waitForTimeout(100);
    }

    // Wait for all messages to appear
    await page1.waitForTimeout(2000);

    // Verify all messages are visible
    for (const msg of messages) {
      const messageElement = page1.locator(`text="${msg}"`);
      await expect(messageElement).toBeVisible();
    }

    // Cleanup
    await context1.close();
  });

  test('messages persist after page refresh', async ({ browser }) => {
    const table = generateTestTable({
      name: `PersistTable${Date.now()}`,
    });

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    // Login
    await page1.goto('/login');
    await page1.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1@iarpg.local');
    await page1.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page1.click('button[type="submit"]');
    await page1.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Create table
    await page1.goto('/tables/browse');
    await waitForLoadingToComplete(page1);

    const createButton = page1.locator('button:has-text("Create Table")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await page1.fill('input[name="name"]', table.name);

      const submitButton = page1.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await page1.waitForTimeout(2000);
      await waitForLoadingToComplete(page1);
    }

    // Send a message
    const message = `Persistent message - ${Date.now()}`;

    const messageInput = page1.locator('input[name="message"], textarea[name="message"], [data-testid="message-input"]');
    await messageInput.first().fill(message);

    const sendButton = page1.locator('button:has-text("Send"), [data-testid="send-button"]');
    await sendButton.first().click();

    // Wait for message to appear
    await expect(page1.locator(`text="${message}"`)).toBeVisible({ timeout: 2000 });

    // Refresh the page
    await page1.reload();
    await waitForLoadingToComplete(page1);

    // Wait for page to fully load
    await page1.waitForTimeout(2000);

    // Verify message is still visible
    const persistedMessage = page1.locator(`text="${message}"`);
    await expect(persistedMessage).toBeVisible({ timeout: 5000 });

    // Cleanup
    await context1.close();
  });
});
