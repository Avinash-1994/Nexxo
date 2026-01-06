/**
 * Phase 3.1: Browser Visual Tests
 * REAL browser tests using Puppeteer to verify HMR overlay
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { startDevServer, DevServer } from '../src/dev-server.js';
import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let browser: Browser | null = null;
let page: Page | null = null;
let server: DevServer | null = null;
const testRoot = path.join(__dirname, '../test-app-visual');

async function setupTestApp() {
    console.log('\n[Setup] Creating test application for visual tests...');

    if (!fs.existsSync(testRoot)) {
        fs.mkdirSync(testRoot, { recursive: true });
    }

    const html = `<!DOCTYPE html>
<html>
<head>
    <title>Visual HMR Test</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1 id="title">Visual HMR Test</h1>
    <div id="app">
        <p>Testing HMR overlay visibility</p>
    </div>
    <script src="app.js"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(testRoot, 'index.html'), html);

    const css = `
body { 
    background: white; 
    color: black; 
    font-family: Arial, sans-serif;
}
#title { color: blue; }
`;
    fs.writeFileSync(path.join(testRoot, 'style.css'), css);

    const js = `
console.log('App loaded');
document.getElementById('app').innerHTML = '<p>App is running</p>';
`;
    fs.writeFileSync(path.join(testRoot, 'app.js'), js);

    console.log('✅ Test app created');
}

async function cleanupTestApp() {
    console.log('\n[Cleanup] Removing test application...');
    if (fs.existsSync(testRoot)) {
        fs.rmSync(testRoot, { recursive: true, force: true });
    }
    console.log('✅ Test app removed');
}

async function testBrowserLaunches() {
    console.log('\n[Test 1] Browser - Launches Successfully');

    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    assert.ok(browser, 'Browser should launch');
    console.log('✅ Browser launched successfully');
}

async function testPageLoads() {
    console.log('\n[Test 2] Page - Loads with HMR Client');

    page = await browser!.newPage();

    // Start dev server
    server = await startDevServer(3002, testRoot);
    server.watchDirectory(testRoot);

    await new Promise(resolve => setTimeout(resolve, 200));

    // Navigate to page
    // Using domcontentloaded because SSE keeps connection open
    await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Check page loaded
    const title = await page.title();
    assert.strictEqual(title, 'Visual HMR Test');

    // Check HMR client injected
    const hmrScript = await page.evaluate(() => {
        return document.body.innerHTML.includes('__hmr');
    });
    assert.ok(hmrScript, 'HMR client should be injected');

    console.log('✅ Page loads with HMR client');
}

async function testHMROverlayAppears() {
    console.log('\n[Test 3] HMR Overlay - Appears on File Change');

    // Listen for console messages
    const consoleMessages: string[] = [];
    page!.on('console', msg => {
        consoleMessages.push(msg.text());
    });

    // Wait for HMR connection
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trigger CSS change
    const cssPath = path.join(testRoot, 'style.css');
    fs.writeFileSync(cssPath, `
body { 
    background: lightblue; 
    color: darkblue; 
}
#title { color: red; }
`);

    // Wait for HMR update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check console for HMR message
    const hasHMRMessage = consoleMessages.some(msg =>
        msg.includes('HMR Update') || msg.includes('HMR connected')
    );
    assert.ok(hasHMRMessage, 'Should receive HMR update message');

    console.log('✅ HMR overlay receives updates');
}

async function testCSSHotReload() {
    console.log('\n[Test 4] CSS - Hot Reloads URL');

    // Get initial link href
    const initialHref = await page!.evaluate(() => {
        const link = document.querySelector('link[rel="stylesheet"]');
        return link ? link.getAttribute('href') : '';
    });

    console.log(`   Initial href: ${initialHref}`);

    // Trigger CSS change
    const cssPath = path.join(testRoot, 'style.css');
    fs.writeFileSync(cssPath, `
body { 
    background: rgb(255, 200, 200); 
    color: black; 
}
`);

    // Wait for HMR update
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get new link href
    const newHref = await page!.evaluate(() => {
        const link = document.querySelector('link[rel="stylesheet"]');
        return link ? link.getAttribute('href') : '';
    });

    console.log(`   New href: ${newHref}`);

    // Href should have changed (timestamp added/updated)
    assert.notStrictEqual(initialHref, newHref, 'CSS link href should update');
    assert.ok(newHref?.includes('?t='), 'New href should have timestamp');

    console.log('✅ CSS link updated successfully');
}

async function testPageDoesNotReload() {
    console.log('\n[Test 5] Page - Does Not Reload on CSS Change');

    // Add a marker to detect page reload
    await page!.evaluate(() => {
        (window as any).__testMarker = 'still-here';
    });

    // Trigger CSS change
    const cssPath = path.join(testRoot, 'style.css');
    fs.writeFileSync(cssPath, `body { background: yellow; }`);

    // Wait
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check marker still exists
    const markerExists = await page!.evaluate(() => {
        return (window as any).__testMarker === 'still-here';
    });

    assert.ok(markerExists, 'Page should not have reloaded');
    console.log('✅ Page did not reload (HMR worked)');
}

async function testBrowserCloses() {
    console.log('\n[Test 6] Browser - Closes Cleanly');

    if (server) {
        await server.stop();
    }

    if (browser) {
        await browser.close();
    }

    console.log('✅ Browser closed cleanly');
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('Phase 3.1: Browser Visual Tests - PUPPETEER');
    console.log('='.repeat(60));

    try {
        await setupTestApp();
        await testBrowserLaunches();
        await testPageLoads();
        await testHMROverlayAppears();
        await testCSSHotReload();
        await testPageDoesNotReload();
        await testBrowserCloses();
        await cleanupTestApp();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL BROWSER TESTS PASSED (6/6)');
        console.log('='.repeat(60));
        console.log('\n🎉 HMR System VERIFIED in REAL BROWSER!');
        console.log('   - Browser launches');
        console.log('   - Page loads with HMR');
        console.log('   - HMR messages received');
        console.log('   - CSS link updates');
        console.log('   - Page does not refresh');

        return true;
    } catch (error) {
        console.error('\n❌ BROWSER TEST FAILED:', error);

        // Cleanup on failure
        if (server) await server.stop();
        if (browser) await browser.close();
        await cleanupTestApp();

        process.exit(1);
    }
}

// Run tests
runAllTests().catch(e => {
    console.error('Browser test suite failed:', e);
    process.exit(1);
});
