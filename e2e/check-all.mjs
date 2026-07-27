import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  const ports = [5011, 5012, 5013, 5014];
  for (const port of ports) {
    console.log(`Navigating to http://localhost:${port}...`);
    try {
      await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle', timeout: 5000 });
      console.log(`Port ${port} title:`, await page.title());
    } catch (err) {
      console.error(`Port ${port} failed:`, err.message);
    }
  }
  
  await browser.close();
})();
