import { JSDOM } from 'jsdom';

// Mock browser environment
const dom = new JSDOM('<!DOCTYPE html><body></body>');
global.window = dom.window as any;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.fetch = (() => Promise.resolve()) as any; // Mock fetch

async function runTests() {
    // Dynamic import after globals are set
    const { ErrorOverlay } = await import('../src/runtime/error-overlay.js');

    // Register component if not already registered (might need check)
    if (!customElements.get('urja-error-overlay')) {
        customElements.define('urja-error-overlay', ErrorOverlay);
    }

    console.log('🧪 Running Error Overlay Tests\n');
    let passed = 0;
    let failed = 0;

    try {
        // Test 1: Rendering Build Error
        console.log('Test 1: Render Build Error');
        const overlay = new ErrorOverlay();
        document.body.appendChild(overlay);

        overlay.errors = [{
            type: 'build',
            message: 'Syntax Error: Unexpected token',
            filename: 'src/main.ts',
            lineno: 10,
            colno: 5,
            frame: 'const x = ;'
        }];

        const shadow = overlay.shadowRoot;
        if (!shadow) throw new Error('Shadow root not found');

        const message = shadow.querySelector('.message')?.textContent;
        const file = shadow.querySelector('.file-link')?.textContent;
        const frame = shadow.querySelector('.code-frame')?.textContent;

        if (message?.includes('Syntax Error') && file?.includes('src/main.ts') && frame?.includes('const x = ;')) {
            console.log('✅ Build Error rendered correctly');
            passed++;
        } else {
            console.error('❌ Build Error render failed');
            console.log('Message:', message);
            failed++;
        }

        // Test 2: Tabs Switching
        console.log('\nTest 2: Tab Switching');
        overlay.errors = [
            { type: 'build', message: 'Build Error' },
            { type: 'runtime', message: 'Runtime Error' }
        ];

        // Default should be build
        let activeTab = shadow.querySelector('.tab.active');
        if (activeTab?.textContent?.includes('Build Errors')) {
            console.log('✅ Default tab is Build Errors');
        } else {
            console.error('❌ Default tab incorrect');
            failed++;
        }

        // Switch to runtime
        overlay.switchTab('runtime');
        activeTab = shadow.querySelector('.tab.active');
        const runtimeMsg = shadow.querySelector('.message')?.textContent;

        if (activeTab?.textContent?.includes('Runtime Errors') && runtimeMsg?.includes('Runtime Error')) {
            console.log('✅ Switched to Runtime Errors');
            passed++;
        } else {
            console.error('❌ Tab switch failed');
            failed++;
        }

    } catch (error) {
        console.error('❌ Test failed with exception:', error);
        failed++;
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

runTests();
