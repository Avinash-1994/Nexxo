/**
 * Phase 1.6 HMR Client Runtime Fixture Tests
 *
 * Two layers:
 *  A) Client-side message handling — driven with window.__lunxHmr.simulate()
 *     Tests: update stamp, css-update stamp, state preservation, error logging
 *
 *  B) Server broadcast path — file change → watcher → WS broadcast → stamp
 *     Tests: server sends 'update' on .js change, 'css-update' on .css change
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, 'project');

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg) { process.stdout.write(msg + '\n'); }
function pass(label, ms) { log(`  ✅ ${label}${ms != null ? ` (${ms}ms)` : ''}`); }
function fail(label, msg) { throw new Error(`FAIL [${label}]: ${msg}`); }

const FILES = {
    component: path.join(projectRoot, 'src/component.js'),
    styles:    path.join(projectRoot, 'src/styles.css'),
};

// Reset to clean state
function resetFiles() {
    fs.writeFileSync(FILES.component, 'export const message = "<h1>Version 1</h1>";');
    fs.writeFileSync(FILES.styles, 'body { background: white; } #app { font-size: 16px; }');
}

async function run() {
    log('\n══════════════════════════════════════════════════');
    log(' Phase 1.6 — HMR Client Runtime Tests');
    log('══════════════════════════════════════════════════\n');

    resetFiles();

    const { startDevServer } = await import('../../../src/dev/devServer.js');
    log('[ ] Starting dev server on port 5174...');
    const server = await startDevServer({ root: projectRoot, port: 5174, logLevel: 'silent' });
    log('[+] Dev server ready\n');

    const browser = await chromium.launch({ headless: true });
    const ctx     = await browser.newContext();
    const page    = await ctx.newPage();

    page.on('pageerror', err => log(`[browser-error] ${err.message}`));

    try {
        await page.goto('http://localhost:5174', { waitUntil: 'load' });

        // ── Wait for WS handshake ─────────────────────────────────────────────
        await page.waitForFunction(() => !!window.__lunxHmr?.connected, { timeout: 10_000 });
        pass('WS handshake — connected flag set');

        // Snapshot initial reload count
        let reloads = 0;
        page.on('framenavigated', () => reloads++);
        const baseReloads = reloads;

        log('\n── Layer A: Client-side message handling ────────────────');

        // A1 — update message stamps lastUpdate
        {
            const before = Date.now();
            await page.evaluate(() =>
                window.__lunxHmr.simulate({ type: 'update', modules: ['/src/component.js'] })
            );
            await page.waitForFunction(since => (window.__lunxHmr?.lastUpdate ?? 0) > since, before, { timeout: 5000 });
            const delta = Date.now() - before;
            if (reloads > baseReloads) fail('A1', 'simulate(update) triggered a full reload');
            pass('A1 — update message → lastUpdate stamped, no reload', delta);
        }

        // A2 — css-update message stamps lastCssUpdate
        {
            const before = Date.now();
            await page.evaluate(() =>
                window.__lunxHmr.simulate({ type: 'css-update', href: '/src/styles.css' })
            );
            await page.waitForFunction(since => (window.__lunxHmr?.lastCssUpdate ?? 0) > since, before, { timeout: 5000 });
            const delta = Date.now() - before;
            if (reloads > baseReloads) fail('A2', 'simulate(css-update) triggered a full reload');
            pass('A2 — css-update message → lastCssUpdate stamped, no reload', delta);
        }

        // A3 — state preservation across HMR update
        {
            await page.evaluate(() => { window.__testState = 'preserved'; });
            const before = Date.now();
            await page.evaluate(() =>
                window.__lunxHmr.simulate({ type: 'update', modules: ['/src/component.js'] })
            );
            await page.waitForFunction(since => (window.__lunxHmr?.lastUpdate ?? 0) > since, before, { timeout: 5000 });
            const state = await page.evaluate(() => window.__testState);
            if (state !== 'preserved') fail('A3', `State lost — got: ${state}`);
            pass('A3 — HMR update preserves window state');
        }

        // A4 — error message logged, no reload
        {
            const consoleMsgs = [];
            page.on('console', m => consoleMsgs.push(m.text()));
            await page.evaluate(() =>
                window.__lunxHmr.simulate({ type: 'error', message: 'test-err', stack: 'at test' })
            );
            await wait(300);
            const hasErr = consoleMsgs.some(m => m.includes('test-err'));
            if (!hasErr) fail('A4', 'error message not logged to console');
            if (reloads > baseReloads) fail('A4', 'error message triggered a reload');
            pass('A4 — error message logged, no reload');
        }

        log('\n── Layer B: Server broadcast path ───────────────────────');

        // B1 — JS file change → server broadcasts update → lastUpdate stamped
        {
            const before = Date.now();
            fs.writeFileSync(FILES.component, 'export const message = "<h1>Version 2</h1>";');
            await page.waitForFunction(since => (window.__lunxHmr?.lastUpdate ?? 0) > since, before, { timeout: 8000 });
            const delta = Date.now() - before;
            if (reloads > baseReloads) fail('B1', 'JS change triggered a full reload');
            pass('B1 — JS file change → server broadcast → lastUpdate stamped', delta);
        }

        // B2 — CSS file change → server broadcasts css-update → lastCssUpdate stamped
        {
            const before = Date.now();
            fs.writeFileSync(FILES.styles, 'body { background: blue; } #app { font-size: 16px; }');
            await page.waitForFunction(since => (window.__lunxHmr?.lastCssUpdate ?? 0) > since, before, { timeout: 8000 });
            const delta = Date.now() - before;
            if (reloads > baseReloads) fail('B2', 'CSS change triggered a full reload');
            pass('B2 — CSS file change → server broadcast → lastCssUpdate stamped', delta);
        }

        log('\n══════════════════════════════════════════════════');
        log(' ✅ Phase 1.6 — ALL TESTS PASSED');
        log('══════════════════════════════════════════════════\n');

    } finally {
        await browser.close();
        await server.close();
        resetFiles();
    }
}

run().catch(e => {
    log(`\nFatal Test Error: ${e.message ?? e}`);
    process.exit(1);
});
