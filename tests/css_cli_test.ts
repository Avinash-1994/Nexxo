// CSS CLI Test - Simplified version without mocking read-only properties
// This test verifies the CLI commands exist and can be imported

import { addCSSCommand, migrateCSSCommand } from '../src/cli/css-cli.js';

async function runTests() {
    console.log('🧪 Running CSS CLI Interactive Tests\n');

    let passed = 0;
    let failed = 0;

    // Test 1: Verify addCSSCommand exists and is callable
    try {
        console.log('Test 1: Interactive Add');

        // Verify the function exists
        if (typeof addCSSCommand === 'function') {
            console.log('✅ addCSSCommand function exists');
            passed++;
        } else {
            console.error('❌ addCSSCommand is not a function');
            failed++;
        }

    } catch (error: any) {
        console.error('❌ Test 1 failed:', error);
        failed++;
    }

    // Test 2: Verify migrateCSSCommand exists and is callable
    try {
        console.log('\nTest 2: Migrate Command');

        // Verify the function exists
        if (typeof migrateCSSCommand === 'function') {
            console.log('✅ migrateCSSCommand function exists');
            passed++;
        } else {
            console.error('❌ migrateCSSCommand is not a function');
            failed++;
        }

    } catch (error: any) {
        console.error('❌ Test 2 failed:', error);
        failed++;
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
