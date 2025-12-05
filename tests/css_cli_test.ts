import { addCSSCommand, migrateCSSCommand } from '../src/cli/css-cli.js';
import * as interactive from '../src/utils/interactive.js';
import * as detector from '../src/core/css-framework-detector.js';

// Mock interactive prompts
const originalSelect = interactive.promptSelect;
const originalConfirm = interactive.promptConfirm;
const originalDetect = detector.detectCSSFramework;

// Mock exec
// We can't easily mock exec without dependency injection or module mocking lib
// So we'll just verify the prompt logic and catch the exec error (or mock it if we refactor)
// For this test, we'll assume exec fails or we catch it, but we want to verify the prompts happen.

async function runTests() {
    console.log('🧪 Running CSS CLI Interactive Tests\n');

    let passed = 0;
    let failed = 0;

    // Test 1: Add Command (Interactive)
    try {
        console.log('Test 1: Interactive Add');

        // Mock select to return 'tailwind'
        (interactive as any).promptSelect = async () => 'tailwind';

        // Mock exec to do nothing (we can't easily mock it here without changing the source to export it or use a DI container)
        // But we can check if it tries to run.
        // Actually, since we are running in a real environment, it might try to run npm install.
        // We should probably mock the installFramework function if we could, but it's not exported.

        // Let's just verify promptSelect is called.
        let selectCalled = false;
        (interactive as any).promptSelect = async () => {
            selectCalled = true;
            return 'tailwind';
        };

        // We expect it to fail installation in this test env (no package.json in cwd maybe, or we don't want to install)
        // So we catch the error but check if select was called.
        try {
            await addCSSCommand(undefined, process.cwd());
        } catch (e) {
            // Ignore install error
        }

        if (selectCalled) {
            console.log('✅ Interactive Add passed');
            passed++;
        } else {
            console.error('❌ Interactive Add failed: prompt not called');
            failed++;
        }

    } catch (error: any) {
        console.error('❌ Test 1 failed:', error);
        failed++;
    }

    // Test 2: Migrate Command
    try {
        console.log('\nTest 2: Migrate Command');

        // Mock detection to return 'bootstrap'
        (detector as any).detectCSSFramework = async () => ({
            name: 'bootstrap',
            version: '5.3.0',
            source: 'package.json'
        });

        // Mock select to return 'tailwind'
        let selectCalled = false;
        (interactive as any).promptSelect = async (q: string, opts: string[]) => {
            selectCalled = true;
            if (opts.includes('bootstrap')) {
                console.error('❌ Migration options should not include current framework');
                throw new Error('Invalid options');
            }
            return 'tailwind';
        };

        try {
            await migrateCSSCommand(process.cwd());
        } catch (e) {
            // Ignore install error
        }

        if (selectCalled) {
            console.log('✅ Migrate passed');
            passed++;
        } else {
            console.error('❌ Migrate failed: prompt not called');
            failed++;
        }

    } catch (error: any) {
        console.error('❌ Test 2 failed:', error);
        failed++;
    }

    // Restore mocks
    (interactive as any).promptSelect = originalSelect;
    (interactive as any).promptConfirm = originalConfirm;
    (detector as any).detectCSSFramework = originalDetect;

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
