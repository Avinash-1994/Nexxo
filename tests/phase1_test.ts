import { FixStore } from '../src/ai/local/fixStore.js';
import { ErrorMemory } from '../src/ai/core/errorMemory.js';
import { FixAction } from '../src/ai/healer/fixer.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running Phase 1: Local Learning Verification\n');

    const testDir = path.resolve(process.cwd(), 'test_phase1');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    try {
        // 1. Setup Store
        console.log('Test 1: Store Initialization');
        const store = new FixStore(testDir);
        const stats = store.getStats();
        if (stats.errors !== 0) throw new Error('Store should be empty');
        console.log('✅ Store initialized');

        // 2. Learn Error & Fix
        console.log('\nTest 2: Learning Error & Fix');
        const rawError = "Module not found: Error: Can't resolve 'react'";
        const learnedError = ErrorMemory.normalize(rawError, { framework: 'react' });

        store.saveError(learnedError);

        const fix: FixAction = {
            type: 'SHELL_COMMAND',
            description: 'Install react',
            command: 'npm install react',
            confidence: 1
        };

        const fixId = store.saveFix(learnedError.id, fix);

        const savedFixes = store.findFixes(learnedError.id);
        if (savedFixes.length !== 1) throw new Error('Fix not saved');
        if (savedFixes[0].command !== 'npm install react') throw new Error('Wrong fix content');
        console.log('✅ Error and Fix learned');

        // 3. Record Outcome
        console.log('\nTest 3: Recording Outcome');
        store.recordOutcome(fixId, true);
        const stats2 = store.getStats();
        if (stats2.successfulFixes !== 1) throw new Error('Outcome not recorded');
        console.log('✅ Outcome recorded');

        // 4. Forget
        console.log('\nTest 4: Forgetting Pattern');
        store.deleteError(learnedError.id);
        const stats3 = store.getStats();
        if (stats3.errors !== 0) throw new Error('Error not deleted');
        console.log('✅ Pattern forgotten');

        console.log('\n✨ All Phase 1 tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
