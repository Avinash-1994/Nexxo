import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('NETWORK ERROR:', response.status(), response.url());
    }
  });

  console.log('Navigating to http://localhost:5010...');
  try {
    await page.goto('http://localhost:5010', { waitUntil: 'networkidle' });
    console.log('Page title:', await page.title());
  } catch (err) {
    console.error('Failed to goto:', err.message);
  }
  
  await browser.close();
})();
