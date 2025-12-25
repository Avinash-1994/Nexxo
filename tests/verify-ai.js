
import { FixGenerator } from '../src/ai/healer/fixer.ts';
// ParsedError is a type, removed from runtime import
import { Telemetry } from '../src/ai/telemetry.ts';
import fs from 'fs/promises';
import path from 'path';

async function verifyAI() {
    console.log('🤖 Verifying AI Systems...');

    // 1. Verify Fix Generation (Self-Healing)
    console.log('   - Testing Fix Generator...');

    // Simulate a missing dependency error
    const mockError = {
        type: 'MISSING_DEPENDENCY',
        originalError: 'Error: Cannot find module "react"',
        context: {
            package: 'react'
        }
    };

    const fixes = FixGenerator.generate(mockError);
    const hasFix = fixes.some(f => f.type === 'SHELL_COMMAND' && f.command.includes('npm install react'));

    if (hasFix) {
        console.log('   ✅ Fix Generator produced correct fix for missing dependency.');
    } else {
        console.error('   ❌ Fix Generator FAILED.');
        console.log('Fixes:', fixes);
        process.exit(1);
    }

    // 2. Verify Telemetry
    console.log('   - Testing Telemetry...');
    const testDir = path.resolve('./ai_test_output');

    try {
        await fs.rm(testDir, { recursive: true, force: true });

        const telemetry = new Telemetry(testDir);
        await telemetry.init();
        telemetry.start();
        await new Promise(r => setTimeout(r, 100)); // Simulate work
        await telemetry.stop(true, { bundleSize: 1024, modules: 5 });

        // Verify file exists
        const files = await fs.readdir(path.join(testDir, '.nextgen', 'telemetry'));
        if (files.length > 0 && files[0].startsWith('session-')) {
            console.log('   ✅ Telemetry saved session file correctly.');
        } else {
            console.error('   ❌ Telemetry FAILED to save file.');
            process.exit(1);
        }
    } catch (e) {
        console.error('   ❌ Telemetry Error:', e);
        process.exit(1);
    } finally {
        await fs.rm(testDir, { recursive: true, force: true });
    }

    console.log('🎉 AI Systems Verified!');
}

verifyAI();
