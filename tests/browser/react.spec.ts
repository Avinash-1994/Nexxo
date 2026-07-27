import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

let server: ChildProcess;
const PORT = 5200;
const BASE = `http://localhost:${PORT}`;
const TEMPLATE = path.resolve(__dirname, '../../templates/react');

test.beforeAll(async () => {
  server = spawn('node', [path.resolve(__dirname, '../../dist/cli.js'), 'dev', '--port', String(PORT)], {
    cwd: TEMPLATE, stdio: 'pipe', env: { ...process.env, LUNX_SKIP_SECURITY: '1' }
  });
  await new Promise<void>((res, rej) => {
    const timer = setTimeout(() => rej(new Error('Server start timeout')), 30000);
    server.stdout?.on('data', (d: Buffer) => {
      if (d.toString().includes('5200') || d.toString().includes('ready') || d.toString().includes('Local')) { clearTimeout(timer); setTimeout(res, 500); }
    });
  });
});

test.afterAll(() => server?.kill());

test('homepage loads with real content', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await expect(page.locator('text=Total Tasks')).toBeVisible();
  expect(errors.filter(e => e.includes('hydration') || e.includes('Error'))).toHaveLength(0);
});

test('navigation works between pages', async ({ page }) => {
  await page.goto(BASE);
  await page.click('text=Projects');
  await expect(page).toHaveURL(/projects/);
  await expect(page.locator('text=Lunx Core')).toBeVisible();
});

test('form submission works — create task', async ({ page }) => {
  await page.goto(`${BASE}/tasks/new`);
  await page.fill('input[placeholder="Task title"]', 'Write Playwright tests for MFE');
  await page.selectOption('select', 'high');
  await page.click('button[type=submit]');
  await expect(page.locator('text=Task created')).toBeVisible();
});

test('mobile layout at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(BASE);
  const width = await page.evaluate(() => document.body.scrollWidth);
  expect(width).toBeLessThanOrEqual(375);
});
