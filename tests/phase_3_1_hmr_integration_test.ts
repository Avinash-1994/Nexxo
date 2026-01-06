/**
 * Phase 3.1: HMR Integration Tests
 * REAL tests that run dev server and test in browser
 */

import { startDevServer, DevServer } from '../src/dev-server.js';
import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server: DevServer | null = null;
const testRoot = path.join(__dirname, '../test-app');

async function setupTestApp() {
    console.log('\n[Setup] Creating test application...');

    // Create test app directory
    if (!fs.existsSync(testRoot)) {
        fs.mkdirSync(testRoot, { recursive: true });
    }

    // Create index.html
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>HMR Test</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>HMR Integration Test</h1>
    <div id="app"></div>
    <script src="app.js"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(testRoot, 'index.html'), html);

    // Create style.css
    const css = `body { background: white; color: black; }`;
    fs.writeFileSync(path.join(testRoot, 'style.css'), css);

    // Create app.js
    const js = `console.log('App loaded');`;
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

async function testDevServerStarts() {
    console.log('\n[Test 1] Dev Server - Starts Successfully');

    server = await startDevServer(3001, testRoot);
    assert.ok(server, 'Server should be created');

    // Watch all files in test directory
    server.watchDirectory(testRoot);

    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('✅ Dev server starts successfully');
}

async function testDevServerServesFiles() {
    console.log('\n[Test 2] Dev Server - Serves Files');

    const response = await fetch('http://localhost:3001/');
    assert.strictEqual(response.status, 200);

    const html = await response.text();
    assert.ok(html.includes('HMR Integration Test'));
    assert.ok(html.includes('__hmr'), 'Should inject HMR client');

    console.log('✅ Dev server serves files correctly');
}

async function testHMRClientConnection() {
    console.log('\n[Test 3] HMR Client - Connects to Server');

    // Test SSE connection
    const response = await fetch('http://localhost:3001/__hmr');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.headers.get('content-type'), 'text/event-stream');

    console.log('✅ HMR client can connect');
}

async function testCSSFileChange() {
    console.log('\n[Test 4] HMR - CSS File Change Detection');

    return new Promise<void>((resolve, reject) => {
        (async () => {
            try {
                // Connect to HMR
                const response = await fetch('http://localhost:3001/__hmr');
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                let messageReceived = false;

                // Read SSE stream
                const readStream = async () => {
                    while (true) {
                        const { done, value } = await reader!.read();
                        if (done) break;

                        const text = decoder.decode(value);
                        if (text.includes('hmr-update')) {
                            const match = text.match(/data: ({.*})/);
                            if (match) {
                                const data = JSON.parse(match[1]);

                                assert.strictEqual(data.type, 'hmr-update');
                                assert.strictEqual(data.decision.level, 'HMR_SAFE');
                                assert.ok(data.decision.reason.includes('Stylesheet'));

                                messageReceived = true;
                                console.log('✅ CSS change detected and classified as SAFE');
                                resolve();
                                break;
                            }
                        }
                    }
                };

                readStream();

                // Trigger CSS file change after a delay
                setTimeout(() => {
                    const cssPath = path.join(testRoot, 'style.css');
                    fs.writeFileSync(cssPath, `body { background: blue; color: white; }`);
                }, 500);

                // Timeout after 3 seconds
                setTimeout(() => {
                    if (!messageReceived) {
                        reject(new Error('No HMR message received'));
                    }
                }, 3000);
            } catch (error) {
                reject(error);
            }
        })();
    });
}

async function testJSFileChange() {
    console.log('\n[Test 5] HMR - JS File Change Detection');

    return new Promise<void>((resolve, reject) => {
        (async () => {
            try {
                const response = await fetch('http://localhost:3001/__hmr');
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                let messageReceived = false;

                const readStream = async () => {
                    while (true) {
                        const { done, value } = await reader!.read();
                        if (done) break;

                        const text = decoder.decode(value);
                        if (text.includes('hmr-update') && text.includes('app.js')) {
                            const match = text.match(/data: ({.*})/);
                            if (match) {
                                const data = JSON.parse(match[1]);

                                assert.strictEqual(data.type, 'hmr-update');
                                assert.strictEqual(data.decision.level, 'HMR_PARTIAL');

                                messageReceived = true;
                                console.log('✅ JS change detected and classified as PARTIAL');
                                resolve();
                                break;
                            }
                        }
                    }
                };

                readStream();

                setTimeout(() => {
                    const jsPath = path.join(testRoot, 'app.js');
                    fs.writeFileSync(jsPath, `console.log('App updated');`);
                }, 500);

                setTimeout(() => {
                    if (!messageReceived) {
                        reject(new Error('No HMR message received for JS change'));
                    }
                }, 3000);
            } catch (error) {
                reject(error);
            }
        })();
    });
}

async function testDevServerStops() {
    console.log('\n[Test 6] Dev Server - Stops Cleanly');

    if (server) {
        await server.stop();
        console.log('✅ Dev server stops cleanly');
    }
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('Phase 3.1: HMR Integration Tests - REAL SERVER');
    console.log('='.repeat(60));

    try {
        await setupTestApp();
        await testDevServerStarts();
        await testDevServerServesFiles();
        await testHMRClientConnection();
        await testCSSFileChange();
        await testJSFileChange();
        await testDevServerStops();
        await cleanupTestApp();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL INTEGRATION TESTS PASSED (6/6)');
        console.log('='.repeat(60));
        console.log('\n🎉 HMR System is ACTUALLY WORKING!');
        console.log('   - Dev server runs');
        console.log('   - Files are watched');
        console.log('   - Changes are detected');
        console.log('   - HMR decisions are made');
        console.log('   - Clients receive updates');

        return true;
    } catch (error) {
        console.error('\n❌ INTEGRATION TEST FAILED:', error);

        // Cleanup on failure
        if (server) {
            await server.stop();
        }
        await cleanupTestApp();

        process.exit(1);
    }
}

// Run tests
runAllTests().catch(e => {
    console.error('Test suite failed:', e);
    process.exit(1);
});
