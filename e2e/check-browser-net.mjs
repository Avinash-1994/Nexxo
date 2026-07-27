import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('request', req => console.log('REQ:', req.url()));
  page.on('response', res => console.log('RES:', res.status(), res.headers()['content-type'], res.url()));

  console.log('Navigating to http://localhost:5010...');
  await page.goto('http://localhost:5010', { waitUntil: 'networkidle' });
  
  await browser.close();
})();
