
/**
 * Module 4: Legacy & Windows Test
 * Validates Day 25 Polyfills & Path Normalization
 */

import { PolyfillInjector, CORE_JS_IMPORT } from '../src/polyfills/corejs.js';
import { PathOps } from '../src/utils/path-normalize.js';

async function runLegacyTest() {
    console.log('🧪 Testing Legacy & Windows Support...');

    // 1. Test Polyfill Injector
    console.log('  Scenario 1: IE11 Polyfill...');
    const modernCode = "const x = 1;";
    const injected = PolyfillInjector.transform(modernCode, ['ie 11']);

    if (!injected.includes(CORE_JS_IMPORT)) {
        throw new Error('Failed to inject CoreJS for IE11');
    }
    console.log('  ✅ IE11 Injection Verified');

    const ignored = PolyfillInjector.transform(modernCode, ['chrome 100']);
    if (ignored.includes(CORE_JS_IMPORT)) {
        throw new Error('Injecting CoreJS unnecessarily for Chrome');
    }
    console.log('  ✅ Modern Target Ignored');


    // 2. Test Path Normalization (Windows Simulation)
    console.log('  Scenario 2: Windows Path Normalization...');
    const winPath = 'C:\\Users\\Lunx\\Project';
    const normalized = PathOps.normalize(winPath);

    if (normalized !== 'C:/Users/Lunx/Project') {
        throw new Error(`Normalization failed. Got: ${normalized}`);
    }

    // We can't easily force path.join to behave like Windows on Linux
    // But we verified the regex replacement logic above.
    console.log('  ✅ Windows Path Normalized');

    console.log('---------------------------');
    console.log('🎉 Day 25 Legacy/Windows Verified!');
}

runLegacyTest().catch(e => {
    console.error('❌ Legacy Test Failed:', e);
    process.exit(1);
});
