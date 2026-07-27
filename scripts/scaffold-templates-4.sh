#!/bin/bash
# Part 4: stub remaining meta-frameworks + verification runner
set -e
ROOT="/home/avinash/Desktop/framework_practis/build"
T="$ROOT/templates"

stub() {
  local name=$1 fw=$2 desc=$3
  mkdir -p "$T/$name/src"
  cat > "$T/$name/package.json" <<PEOF
{"name":"lunx-${name}-template","version":"0.0.1","private":true,"type":"module","scripts":{"dev":"lunx dev","build":"lunx build","preview":"lunx preview"},"lunx":{"template":true,"framework":"${fw}","description":"${desc}"},"devDependencies":{"lunx":"file:../..","typescript":"5.4.5"}}
PEOF
  cat > "$T/$name/lunx.config.ts" <<CEOF
import { defineConfig } from 'lunx';
export default defineConfig({ framework: '${fw}' });
CEOF
  cat > "$T/$name/README.md" <<REOF
# Lunx ${name} Template — ${desc}
\`\`\`bash
npm install && npm run dev
\`\`\`
REOF
}

stub nuxt           nuxt             "Lunx SaaS — landing + dashboard"
stub nextjs-pages   next             "Lunx Store — Next.js e-commerce"
stub solidstart     solidstart       "Lunx Dashboard — streaming SSR analytics"
stub qwik           qwik             "Lunx Store — zero-JS e-commerce"
stub tanstack-start tanstack-start   "Lunx Invoices — freelancer billing app"
stub analog         analog           "Lunx CMS — headless CMS with Angular"
stub waku           waku             "Lunx Shop — RSC-powered catalogue"
stub react-router-v7 react-router   "Lunx Profiles — hybrid SSR+SPA directory"
stub vitepress      vitepress        "Lunx API Docs — full documentation site"
stub electron       electron         "Lunx Notes Desktop — native note app"
stub tauri          tauri            "Lunx Files Desktop — Rust file manager"
stub angular        angular          "Lunx HR — employee management dashboard"

# Add real index.html entries for stub templates
for name in nuxt nextjs-pages solidstart qwik tanstack-start analog waku react-router-v7 vitepress electron tauri angular; do
  cat > "$T/$name/index.html" <<HEOF
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Lunx ${name} Template</title></head><body><div id="app"><h1>⚡ Lunx — ${name} template</h1><p>Run: npm install && npm run dev</p></div><script type="module" src="/src/main.ts"></script></body></html>
HEOF
  cat > "$T/$name/src/main.ts" <<MEOF
console.log('[lunx:${name}] Template ready. Built with Lunx.');
document.getElementById('app')!.innerHTML = '<div style="font-family:system-ui;padding:40px;background:#0f172a;color:#f1f5f9;min-height:100vh"><h1>⚡ Lunx ${name}</h1><p style="color:#94a3b8;margin-top:16px">Template scaffold — extend this with your app code.</p></div>';
MEOF
done

echo "✅ all stubs done"

# ── PLAYWRIGHT BROWSER TEST ───────────────────────────────────────
mkdir -p "$ROOT/tests/browser"
cat > "$ROOT/tests/browser/react.spec.ts" <<'EOF'
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
EOF

cat > "$ROOT/tests/browser/vue.spec.ts" <<'EOF'
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
EOF

cat > "$ROOT/tests/browser/playwright.config.ts" <<'EOF'
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  timeout: 60000,
  use: { headless: true },
  reporter: [['list'], ['html', { open: 'never' }]],
});
EOF

echo "✅ stubs + playwright tests done"
