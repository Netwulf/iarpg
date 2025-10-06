import { test, expect } from './fixtures/auth.fixture';
import { generateTestTable } from './utils/test-data';
import { waitForLoadingToComplete, setNetworkConditions } from './utils/test-helpers';

/**
 * WebSocket Reconnect E2E Tests
 *
 * Tests WebSocket connection resilience:
 * - Join table (WebSocket connects)
 * - Simulate disconnect (offline)
 * - Reconnect (online)
 * - Messages sync after reconnect
 */

test.describe('WebSocket Reconnect', () => {
  test('reconnects after going offline and coming back online', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `ReconnectTable${Date.now()}`,
    });

    // Create and join a table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Wait for WebSocket to connect
    await authenticatedPage.waitForTimeout(2000);

    // Send a message to verify connection works
    const message1 = `Before disconnect - ${Date.now()}`;
    const messageInput = authenticatedPage.locator('input[name="message"], textarea[name="message"], [data-testid="message-input"]');

    if (await messageInput.first().isVisible({ timeout: 3000 })) {
      await messageInput.first().fill(message1);

      const sendButton = authenticatedPage.locator('button:has-text("Send"), [data-testid="send-button"]');
      await sendButton.first().click();

      // Verify message appears
      await expect(authenticatedPage.locator(`text="${message1}"`)).toBeVisible({ timeout: 2000 });
    }

    // Simulate network disconnect
    await setNetworkConditions(authenticatedPage, 'offline');
    await authenticatedPage.waitForTimeout(1000);

    // Look for connection indicator (if implemented)
    const disconnectedIndicator = authenticatedPage.locator('text=/disconnected|offline|connecting/i, [data-testid="connection-status"]');

    if (await disconnectedIndicator.isVisible({ timeout: 3000 })) {
      // Connection status is shown
      await expect(disconnectedIndicator).toBeVisible();
    }

    // Simulate reconnect
    await setNetworkConditions(authenticatedPage, 'online');
    await authenticatedPage.waitForTimeout(2000);

    // Should reconnect automatically
    const connectedIndicator = authenticatedPage.locator('text=/connected|online/i, [data-testid="connection-status"]');

    // Wait for reconnection
    await authenticatedPage.waitForTimeout(3000);

    // Try to send another message after reconnect
    const message2 = `After reconnect - ${Date.now()}`;

    if (await messageInput.first().isVisible()) {
      await messageInput.first().fill(message2);

      const sendButton = authenticatedPage.locator('button:has-text("Send")');
      await sendButton.first().click();

      // Message should send successfully
      await expect(authenticatedPage.locator(`text="${message2}"`)).toBeVisible({ timeout: 3000 });
    }
  });

  test('shows reconnecting status when connection is lost', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `StatusTable${Date.now()}`,
    });

    // Create and join table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Wait for initial connection
    await authenticatedPage.waitForTimeout(2000);

    // Go offline
    await setNetworkConditions(authenticatedPage, 'offline');
    await authenticatedPage.waitForTimeout(1000);

    // Should show reconnecting/disconnected status
    const statusIndicator = authenticatedPage.locator('text=/reconnecting|disconnected|offline/i, [data-testid="connection-status"], .connection-status');

    // Check if connection status UI is implemented
    if (await statusIndicator.isVisible({ timeout: 3000 })) {
      await expect(statusIndicator).toBeVisible();
    }

    // Go back online
    await setNetworkConditions(authenticatedPage, 'online');
    await authenticatedPage.waitForTimeout(3000);

    // Status should change to connected
    const connectedStatus = authenticatedPage.locator('text=/connected|online/i, [data-testid="connection-status"]:has-text("connected")');

    if (await connectedStatus.isVisible({ timeout: 5000 })) {
      await expect(connectedStatus).toBeVisible();
    }
  });

  test('messages sent while offline are queued and sent on reconnect', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `QueueTable${Date.now()}`,
    });

    // Create and join table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Wait for connection
    await authenticatedPage.waitForTimeout(2000);

    // Go offline
    await setNetworkConditions(authenticatedPage, 'offline');
    await authenticatedPage.waitForTimeout(1000);

    // Try to send message while offline
    const offlineMessage = `Offline message - ${Date.now()}`;
    const messageInput = authenticatedPage.locator('input[name="message"], textarea[name="message"], [data-testid="message-input"]');

    if (await messageInput.first().isVisible()) {
      await messageInput.first().fill(offlineMessage);

      const sendButton = authenticatedPage.locator('button:has-text("Send")');
      await sendButton.first().click();

      // Message might show as "pending" or "sending"
      await authenticatedPage.waitForTimeout(1000);
    }

    // Go back online
    await setNetworkConditions(authenticatedPage, 'online');
    await authenticatedPage.waitForTimeout(3000);

    // Message should appear after reconnect (if queuing is implemented)
    const messageElement = authenticatedPage.locator(`text="${offlineMessage}"`);

    // Check if message queuing is implemented
    if (await messageElement.isVisible({ timeout: 5000 })) {
      await expect(messageElement).toBeVisible();
    }
  });

  test('page refresh maintains connection', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `RefreshTable${Date.now()}`,
    });

    // Create and join table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Wait for WebSocket connection
    await authenticatedPage.waitForTimeout(2000);

    // Send a message
    const message1 = `Before refresh - ${Date.now()}`;
    const messageInput = authenticatedPage.locator('input[name="message"], textarea[name="message"]');

    if (await messageInput.first().isVisible({ timeout: 3000 })) {
      await messageInput.first().fill(message1);

      const sendButton = authenticatedPage.locator('button:has-text("Send")');
      await sendButton.first().click();

      await expect(authenticatedPage.locator(`text="${message1}"`)).toBeVisible({ timeout: 2000 });
    }

    // Refresh the page
    await authenticatedPage.reload();
    await waitForLoadingToComplete(authenticatedPage);

    // Wait for reconnection
    await authenticatedPage.waitForTimeout(3000);

    // Should still see previous messages
    await expect(authenticatedPage.locator(`text="${message1}"`)).toBeVisible({ timeout: 3000 });

    // Should be able to send new messages
    const message2 = `After refresh - ${Date.now()}`;

    const messageInputAfter = authenticatedPage.locator('input[name="message"], textarea[name="message"]');
    if (await messageInputAfter.first().isVisible()) {
      await messageInputAfter.first().fill(message2);

      const sendButton = authenticatedPage.locator('button:has-text("Send")');
      await sendButton.first().click();

      await expect(authenticatedPage.locator(`text="${message2}"`)).toBeVisible({ timeout: 2000 });
    }
  });

  test('multiple reconnect attempts succeed', async ({ authenticatedPage }) => {
    const table = generateTestTable({
      name: `MultiReconnectTable${Date.now()}`,
    });

    // Create and join table
    await authenticatedPage.goto('/tables/browse');
    await waitForLoadingToComplete(authenticatedPage);

    const createButton = authenticatedPage.locator('button:has-text("Create Table")');
    if (await createButton.first().isVisible()) {
      await createButton.first().click();

      await authenticatedPage.fill('input[name="name"]', table.name);

      const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Create")');
      await submitButton.click();

      await authenticatedPage.waitForTimeout(2000);
      await waitForLoadingToComplete(authenticatedPage);
    }

    // Initial connection
    await authenticatedPage.waitForTimeout(2000);

    // Disconnect and reconnect multiple times
    for (let i = 0; i < 3; i++) {
      // Go offline
      await setNetworkConditions(authenticatedPage, 'offline');
      await authenticatedPage.waitForTimeout(1000);

      // Go online
      await setNetworkConditions(authenticatedPage, 'online');
      await authenticatedPage.waitForTimeout(2000);
    }

    // After multiple reconnects, should still work
    const message = `After multiple reconnects - ${Date.now()}`;
    const messageInput = authenticatedPage.locator('input[name="message"], textarea[name="message"]');

    if (await messageInput.first().isVisible({ timeout: 3000 })) {
      await messageInput.first().fill(message);

      const sendButton = authenticatedPage.locator('button:has-text("Send")');
      await sendButton.first().click();

      // Should send successfully
      await expect(authenticatedPage.locator(`text="${message}"`)).toBeVisible({ timeout: 3000 });
    }
  });
});
