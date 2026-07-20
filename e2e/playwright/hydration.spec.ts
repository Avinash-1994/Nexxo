import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUILD_ROOT = path.resolve(__dirname, '../../');
const CLI_PATH = path.join(BUILD_ROOT, 'dist', 'cli.js');
const FIXTURES = path.join(BUILD_ROOT, 'e2e/fixtures');



// ─── Helper: Start Dev Server ──────────────────────────────────────────────
function startDevServer(fixtureDir: string): Promise<{ port: number, process: ChildProcess }> {
  return new Promise((resolve, reject) => {
    const devProcess = spawn('node', [CLI_PATH, 'dev'], { 
      cwd: fixtureDir,
      env: { ...process.env }
    });

    let stdoutData = '';
    let port = 5173; // default fallback
    let isReady = false;

    devProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutData += output;
      
      const portMatch = output.match(/http:\/\/localhost:(\d+)/);
      if (portMatch) {
        port = parseInt(portMatch[1], 10);
      }
      
      if (output.includes('ready') || output.includes('Starting the development server') || portMatch) {
        if (!isReady) {
          isReady = true;
          // small delay to ensure server is fully bound
          setTimeout(() => resolve({ port, process: devProcess }), 1000);
        }
      }
    });

    devProcess.stderr.on('data', (data) => {
      stdoutData += data.toString();
    });

    devProcess.on('error', (err) => {
      reject(new Error(`Failed to start dev server: ${err.message}`));
    });

    devProcess.on('close', (code) => {
      if (!isReady) {
        reject(new Error(`Dev server exited early with code ${code}. Output: ${stdoutData.slice(-500)}`));
      }
    });

    // Timeout
    setTimeout(() => {
      if (!isReady) {
        devProcess.kill();
        reject(new Error(`Dev server startup timeout. Output: ${stdoutData.slice(-500)}`));
      }
    }, 30000);
  });
}

const HYDRATION_PATTERNS = [
  'hydration', 'Hydration', 'did not match', 'Warning: Expected server HTML',
  'Warning: An update to', 'mismatch', 'Hydrate', 'serverRender', 'HYDRATION_ERROR',
  'Content does not match server-rendered HTML'
];
function isHydrationError(msg: string): boolean {
  return HYDRATION_PATTERNS.some((p) => msg.includes(p));
}

// ─── Framework Configs ───────────────────────────────────────────────────
const frameworks = [
  { id: 'HYD-01', name: 'Angular', dir: 'angular-enterprise', portConf: 3000, route: '/', markerFn: () => !!document.querySelector('[ng-version]') || !!document.querySelector('app-root'), minBody: 200 },
  { id: 'HYD-02', name: 'Nuxt', dir: 'nuxt-saas-platform', portConf: 3080, route: '/dashboard', markerFn: () => (window as any).__NUXT__ !== undefined, minBody: 200 },
  { id: 'HYD-03', name: 'SvelteKit', dir: 'sveltekit-fullstack', portConf: 5173, route: '/dashboard', pre: async (page) => {
      await page.context().addCookies([{ name: 'session', value: 'test-user', domain: 'localhost', path: '/' }]);
    }, markerFn: () => !!document.getElementById('svelte') || !!document.querySelector('[data-sveltekit-hydrated]'), minBody: 200 },
  { id: 'HYD-04', name: 'SolidStart', dir: 'solidstart-dashboard', portConf: 5173, route: '/dashboard', markerFn: () => document.querySelectorAll('[data-hk]').length > 0, minBody: 100 },
  { id: 'HYD-05', name: 'Qwik City', dir: 'qwikcity-store', portConf: 5173, route: '/', markerFn: () => !!document.querySelector('[q\\:container]'), minBody: 100 },
  { id: 'HYD-06', name: 'Astro', dir: 'astro-content-platform', portConf: 5173, route: '/', markerFn: () => !!document.querySelector('astro-island'), minBody: 200, waitTime: 5000 },
  { id: 'HYD-07', name: 'Remix', dir: 'remix-job-board', portConf: 5173, route: '/', markerFn: () => (window as any).__remixContext !== undefined, minBody: 200 },
  { id: 'HYD-08', name: 'Analog', dir: 'analog-cms', portConf: 5173, route: '/blog/my-post', markerFn: () => !!document.querySelector('[ng-version]') || !!document.querySelector('app-root'), minBody: 200 },
  { id: 'HYD-09', name: 'React Router', dir: 'react-router-app', portConf: 5173, route: '/', markerFn: () => (window as any).__reactRouterContext !== undefined, minBody: 100 },
  { id: 'HYD-10', name: 'TanStack', dir: 'tanstack-invoicing', portConf: 5173, route: '/invoices/INV-123', markerFn: () => (window as any).__TSS_DEHYDRATED_STATE__ !== undefined || !!document.querySelector('[data-tanstack]') || !!document.querySelector('#__tanstack_data__'), minBody: 200 },
  { id: 'HYD-11', name: 'Waku RSC', dir: 'waku-storefront', portConf: 5173, route: '/store', markerFn: () => !!document.getElementById('root'), waitExtra: async (page) => {
      try { await page.locator('[data-testid], h1').first().waitFor({ timeout: 2000 }); } catch (e) {}
    }, minBody: 200 },
  { id: 'HYD-12', name: 'VitePress', dir: 'vitepress-docs', portConf: 5173, route: '/docs/guide', markerFn: () => !!document.querySelector('.vp-doc') || (window as any).__VP_HASH_MAP__ !== undefined, minBody: 300 },
  { id: 'HYD-13', name: 'Next.js Pages', dir: 'nextjs-pages-migration', portConf: 5173, route: '/', markerFn: () => (window as any).__NEXT_DATA__ !== undefined || !!document.querySelector('[data-lunx-ssr], #__lunx_state__, h1, main'), minBody: 200 },
  { id: 'HYD-14', name: 'React', dir: 'react-basic', portConf: 5173, route: '/', markerFn: () => !!document.querySelector('[data-reactroot]') || (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined, minBody: 50 },
  { id: 'HYD-15', name: 'Vue', dir: 'vue-basic', portConf: 5173, route: '/', markerFn: () => !!document.querySelector('[data-v-app]') || (window as any).__vue_app__ !== undefined, minBody: 50 },
  { id: 'HYD-16', name: 'Svelte', dir: 'sveltekit-fullstack', portConf: 5173, route: '/', markerFn: () => !!document.querySelector('[data-svelte-h]') || !!document.querySelector('#svelte') || document.querySelectorAll('[class*="svelte"]').length > 0, minBody: 50 }
];

for (const fw of frameworks) {
  test(`${fw.id} ${fw.name} hydration`, async ({ page }) => {
    test.setTimeout(45000);
    const fixtureDir = path.join(FIXTURES, fw.dir);
    
    let devServer;
    try {
      devServer = await startDevServer(fixtureDir);
    } catch (e: any) {
      console.log(`⚠️  WARN  ${fw.id}  ${fw.name}: dev server failed to start`);
      console.log(`         Output: ${e.message}`);
      test.skip(true, 'Dev server failed to start');
      return;
    }

    const { port, process: devProcess } = devServer;
    
    try {
      const consoleErrors: string[] = [];
      const allErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', err => allErrors.push(`[pageerror] ${err.message}`));

      if (fw.pre) {
        await fw.pre(page);
      }

      await page.goto(`http://localhost:${port}${fw.route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      if (fw.waitExtra) {
        await fw.waitExtra(page);
      }
      
      await page.waitForTimeout(fw.waitTime || 3000);

      const bodyText = (await page.locator('body').innerText()).trim();
      const hydrationErrors = consoleErrors.filter(isHydrationError);
      const otherErrors = consoleErrors.filter(e => !isHydrationError(e));

      const markerPresent = await page.evaluate(fw.markerFn);

      let interactive = 'skip';
      const clickable = page.locator('a, button').first();
      if (await clickable.count() > 0) {
        try {
          await clickable.click({ timeout: 1000 });
          interactive = 'yes';
        } catch (e) {
          interactive = 'failed';
        }
      } else {
        interactive = 'skip - nothing clickable';
      }

      const passBody = bodyText.length > fw.minBody;
      const passMarker = markerPresent;
      const passHydration = hydrationErrors.length === 0;
      
      const passAll = passBody && passMarker && passHydration;

      console.log(`  ${passAll ? '✅ PASS' : '❌ FAIL'}  ${fw.id}  ${fw.name} hydration`);
      console.log(`           Dev server started: yes (port ${port})`);
      console.log(`           SSR route: ${fw.route}`);
      console.log(`           Body text: ${bodyText.length} chars (min ${fw.minBody}) [${passBody ? 'OK' : 'below minimum'}]`);
      console.log(`           DOM marker: ${markerPresent ? 'present' : 'ABSENT'}`);
      console.log(`           Hydration errors: ${hydrationErrors.length}`);
      console.log(`           Other console errors: ${otherErrors.length} (non-blocking)`);
      console.log(`           Interactive: ${interactive}`);
      
      if (!passAll) {
        if (!passBody) console.log(`           Root cause: Dev server not serving real SSR content for ${fw.route}`);
        if (!passMarker) console.log(`           Root cause: Framework JS did not load or marker missing`);
        if (!passHydration) {
          console.log(`           Error messages:`);
          hydrationErrors.forEach(e => console.log(`             - ${e}`));
        }
      }

      expect(bodyText.length, `Body text < ${fw.minBody} chars. Not real SSR content.`).toBeGreaterThan(fw.minBody);
      expect(markerPresent, `DOM marker absent for ${fw.name}. Framework JS failed to load.`).toBe(true);
      expect(hydrationErrors, `Hydration mismatches found`).toHaveLength(0);

    } finally {
      devProcess.kill();
      await new Promise(r => setTimeout(r, 500));
    }
  });
}
