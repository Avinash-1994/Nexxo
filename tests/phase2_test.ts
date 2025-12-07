import { FixGenerator } from '../src/ai/healer/fixer.js';
import { ErrorParser } from '../src/ai/healer/parser.js';
import { CommonPatterns } from '../src/ai/patterns/common.js';
import { FixStore } from '../src/ai/local/fixStore.js';
import { Evolver } from '../src/ai/learning/evolver.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running Phase 2: Intelligent Fix Generation Verification\n');

    const testDir = path.resolve(process.cwd(), 'test_phase2');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    try {
        // 1. Pattern Library
        console.log('Test 1: Pattern Library Matching');
        const err1 = "Cannot find module 'lodash'";
        const parsed1 = ErrorParser.parse(err1);
        const fixes1 = FixGenerator.generate(parsed1);

        if (fixes1.length === 0) throw new Error('Pattern not matched');
        if (fixes1[0].command !== 'npm install lodash') throw new Error('Wrong fix generated');
        console.log('✅ "Cannot find module" pattern matched');

        const err2 = "Tailwind CSS: warn - content option";
        const parsed2 = ErrorParser.parse(err2);
        const fixes2 = FixGenerator.generate(parsed2);
        if (fixes2[0].type !== 'MANUAL_INSTRUCTION') throw new Error('Tailwind pattern not matched');
        console.log('✅ "Tailwind warning" pattern matched');

        // 2. Evolver & Scoring
        console.log('\nTest 2: Evolver & Scoring');
        const store = new FixStore(testDir);
        const errorId = 'test-error-1';

        // Save 2 fixes: one with high success, one with low
        const learnedError = { id: errorId, signature: 'sig', type: 'unknown', context: {}, timestamp: Date.now() } as any;
        store.saveError(learnedError);

        const fixGood = { type: 'SHELL_COMMAND', description: 'Good Fix', command: 'echo good', confidence: 1 } as any;
        const fixBad = { type: 'SHELL_COMMAND', description: 'Bad Fix', command: 'echo bad', confidence: 1 } as any;

        const idGood = store.saveFix(errorId, fixGood);
        const idBad = store.saveFix(errorId, fixBad);

        // Record outcomes: Good=10 success, Bad=1 success
        for (let i = 0; i < 10; i++) store.recordOutcome(idGood, true);
        store.recordOutcome(idBad, true);
        for (let i = 0; i < 5; i++) store.recordOutcome(idBad, false);

        const bestFixes = store.findFixes(errorId);
        if (bestFixes[0].description !== 'Good Fix') throw new Error('Scoring failed to rank Good Fix first');
        console.log('✅ Fixes ranked correctly by score');

        const evolver = new Evolver(store);
        const evolved = evolver.getBestFix(errorId);
        if (!evolved) throw new Error('Evolver returned nothing');
        console.log('✅ Evolver returned a fix');

        console.log('\n✨ All Phase 2 tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
