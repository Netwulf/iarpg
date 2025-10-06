import { chromium } from '@playwright/test';

async function testLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console messages
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  // Listen to page errors
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  // Go to login page
  await page.goto('https://iarpg-web.vercel.app/login');
  console.log('Navigated to login page');

  // Fill credentials
  await page.fill('input[name="email"]', 'taynanmendes@gmail.com');
  await page.fill('input[name="password"]', '12345678');
  console.log('Filled credentials');

  // Click login
  await page.click('button[type="submit"]');
  console.log('Clicked login button');

  // Wait and check what happens
  await page.waitForTimeout(5000);

  const url = page.url();
  console.log('Current URL:', url);

  const errorElement = await page.locator('text=Invalid email or password').count();
  if (errorElement > 0) {
    console.log('ERROR: Invalid credentials message shown');
  }

  await browser.close();
}

testLogin().catch(console.error);
