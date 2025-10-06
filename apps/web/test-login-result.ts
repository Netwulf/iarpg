import { chromium } from '@playwright/test';

async function testLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture signIn result
  await page.goto('https://iarpg-web.vercel.app/login');

  await page.evaluate(() => {
    const originalSignIn = (window as any).next?.auth?.signIn || (() => {});
    console.log('Patching signIn...');
  });

  await page.fill('input[name="email"]', 'taynanmendes@gmail.com');
  await page.fill('input[name="password"]', '12345678');

  // Add script to capture result
  await page.addScriptTag({
    content: `
      window.loginResult = null;
      const form = document.querySelector('form');
      const button = form.querySelector('button[type="submit"]');
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('=== Intercepted login click ===');
        const { signIn } = await import('next-auth/react');
        const result = await signIn('credentials', {
          email: 'taynanmendes@gmail.com',
          password: '12345678',
          redirect: false,
        });
        console.log('=== signIn result:', JSON.stringify(result));
        window.loginResult = result;
      });
    `
  });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => (window as any).loginResult);
  console.log('=== CAPTURED RESULT:', JSON.stringify(result, null, 2));

  await browser.close();
}

testLogin().catch(console.error);
