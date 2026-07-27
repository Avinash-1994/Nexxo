import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

let server: ChildProcess;
const PORT = 5201;
const BASE = `http://localhost:${PORT}`;
const TEMPLATE = path.resolve(__dirname, '../../templates/vue');

test.beforeAll(async () => {
  server = spawn('node', [path.resolve(__dirname, '../../dist/cli.js'), 'dev', '--port', String(PORT)], {
    cwd: TEMPLATE, stdio: 'pipe', env: { ...process.env, LUNX_SKIP_SECURITY: '1' }
  });
  await new Promise<void>((res, rej) => {
    const timer = setTimeout(() => rej(new Error('Server start timeout')), 30000);
    server.stdout?.on('data', (d: Buffer) => {
      if (d.toString().includes(String(PORT)) || d.toString().includes('ready')) { clearTimeout(timer); setTimeout(res, 500); }
    });
  });
});
test.afterAll(() => server?.kill());

test('homepage — featured products visible', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.locator('text=Wireless Headphones')).toBeVisible();
  await expect(page.locator('text=Lunx Shop')).toBeVisible();
});

test('add to cart updates count', async ({ page }) => {
  await page.goto(BASE);
  await page.click('button:has-text("Add to Cart")');
  await expect(page.locator('text=Cart (1)')).toBeVisible();
});

test('products page with search filter', async ({ page }) => {
  await page.goto(`${BASE}/products`);
  await page.fill('input[placeholder="Search products..."]', 'keyboard');
  await expect(page.locator('text=Mechanical Keyboard')).toBeVisible();
});

test('login form submits successfully', async ({ page }) => {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type=email]', 'dev@lunx.dev');
  await page.fill('input[type=password]', 'password123');
  await page.click('button[type=submit]');
  await expect(page.locator('text=Welcome back')).toBeVisible();
});
