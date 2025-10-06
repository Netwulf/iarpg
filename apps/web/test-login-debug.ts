import { chromium } from '@playwright/test';

async function testLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to all network requests
  page.on('request', req => {
    if (req.url().includes('auth') || req.url().includes('login')) {
      console.log('REQUEST:', req.method(), req.url());
    }
  });

  page.on('response', async res => {
    if (res.url().includes('auth') || res.url().includes('login')) {
      console.log('RESPONSE:', res.status(), res.url());
      if (res.status() >= 400) {
        const body = await res.text().catch(() => 'Could not read body');
        console.log('ERROR BODY:', body);
      }
    }
  });

  // Listen to console messages
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('error') || msg.text().includes('Error')) {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  await page.goto('https://iarpg-web.vercel.app/login');
  console.log('=== Navigated to login page ===');

  await page.fill('input[name="email"]', 'taynanmendes@gmail.com');
  await page.fill('input[name="password"]', '12345678');
  console.log('=== Filled credentials ===');

  await page.click('button[type="submit"]');
  console.log('=== Clicked login button ===');

  await page.waitForTimeout(5000);

  const url = page.url();
  console.log('=== Final URL:', url);

  const errorMsg = await page.locator('.text-red').textContent().catch(() => null);
  if (errorMsg) {
    console.log('=== ERROR MESSAGE:', errorMsg);
  }

  await browser.close();
}

testLogin().catch(console.error);
