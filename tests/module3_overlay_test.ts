
/**
 * Module 3: Elite DX - Overlay Reliability Test
 * Validates Day 15 Error Overlay Logic using JSDOM
 */

import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

const OVERLAY_UI_PATH = path.resolve('src/dev/overlay/overlay-ui.ts');
const OVERLAY_CLIENT_PATH = path.resolve('src/dev/overlay/overlay-client.ts');

// We need to bundle or load these files into JSDOM. 
// Since they are TS, we can't load them directly into JSDOM script tags easily without transpiling.
// However, we can test the Logic by importing them in Node if we mock the browser env globally via JSDOM *before* import.

async function setupJSDOM() {
    const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
        url: 'http://localhost/',
        runScripts: 'dangerously',
        resources: 'usable'
    });

    // Polyfill globals
    (global as any).window = dom.window;
    (global as any).document = dom.window.document;
    (global as any).HTMLElement = dom.window.HTMLElement;
    (global as any).customElements = dom.window.customElements;
    (global as any).ErrorEvent = dom.window.ErrorEvent;
    (global as any).PromiseRejectionEvent = dom.window.PromiseRejectionEvent;

    return dom;
}

async function runOverlayTest() {
    console.log('🧪 Testing Error Overlay Reliability...');

    await setupJSDOM();

    // Import Client (Trigger side effects)
    // Note: TypeScript might cache modules, but this is a fresh run.
    // Use dynamic import to ensure it executes in our polyfilled env
    await import('../src/dev/overlay/overlay-ui.js');
    const { activateOverlay } = await import('../src/dev/overlay/overlay-client.js');

    activateOverlay(); // Ensure listeners attached

    // Test 1: Runtime Error
    console.log('  Test 1: Capturing Runtime Error...');
    const errEvent = new window.ErrorEvent('error', {
        error: new Error('Test Runtime Error'),
        message: 'Test Runtime Error',
        filename: 'app.js',
        lineno: 42
    });
    window.dispatchEvent(errEvent);

    // Verify UI
    const overlay = document.querySelector('nexxo-error-overlay');
    if (!overlay) throw new Error('Overlay did not appear');

    // Check Shadow DOM content
    // JSDOM shadowRoot support varies, but let's try accessing it.
    // If JSDOM supports open shadow roots:
    const shadow = overlay.shadowRoot;
    if (!shadow) throw new Error('Shadow Root missing');

    const msg = shadow.querySelector('.message');
    if (!msg || msg.textContent !== 'Test Runtime Error') {
        throw new Error(`Message mismatch. Got: ${msg?.textContent}`);
    }
    console.log('  ✅ Runtime Error Captured & Displayed');

    // Test 2: Build Error (via API)
    console.log('  Test 2: Capturing Build Error...');
    (window as any).__NEXXO_OVERLAY__.reportBuildError({
        message: 'Build Failed: Syntax Error',
        file: 'src/main.ts',
        stack: 'Syntax Error at line 1'
    });

    const msg2 = shadow.querySelector('.message');
    if (!msg2 || msg2.textContent !== 'Build Failed: Syntax Error') {
        throw new Error('Build error not updated');
    }
    console.log('  ✅ Build Error Displayed');

    // Test 3: Stress Test (Reliability)
    console.log('  Test 3: Stress Test (100 Errors)...');
    for (let i = 0; i < 100; i++) {
        (window as any).__NEXXO_OVERLAY__.reportBuildError({ message: `Err ${i}` });
        const m = shadow.querySelector('.message');
        if (m?.textContent !== `Err ${i}`) throw new Error(`Stress test failed at ${i}`);
    }
    console.log('  ✅ 100 Errors handled without crash');

    console.log('---------------------------');
    console.log('🎉 Day 15 Overlay Logic Verified!');
}

runOverlayTest().catch(e => {
    console.error('❌ Overlay Test Failed:', e);
    process.exit(1);
});
