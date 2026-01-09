import { AIClient } from '../src/ai/client.js';
import { Telemetry } from '../src/ai/telemetry.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running AI Features Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_ai');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    try {
        // Test 1: AI Client (Local)
        console.log('Test 1: AI Client (Local)');
        const client = new AIClient({ provider: 'local' }, testDir);
        await client.init();

        const prompt = 'Optimize my build';
        const start = Date.now();
        const res1 = await client.complete(prompt);
        const duration1 = Date.now() - start;
        console.log(`First call took ${duration1}ms`);

        if (!res1.includes('Local AI')) throw new Error('Invalid response');

        const start2 = Date.now();
        const res2 = await client.complete(prompt);
        const duration2 = Date.now() - start2;
        console.log(`Second call (cached) took ${duration2}ms`);

        if (res1 !== res2) throw new Error('Cache mismatch');
        if (duration2 > 50) throw new Error('Cache too slow'); // Should be instant
        console.log('✅ AI Client & Caching verified');

        // Test 2: Telemetry
        console.log('\nTest 2: Telemetry');
        const telemetry = new Telemetry(testDir);
        await telemetry.init();

        telemetry.start();
        await new Promise(r => setTimeout(r, 100));
        await telemetry.stop(true, { modules: 10, bundleSize: 1024 }, ['Error 1']);

        const telemetryDir = path.join(testDir, '.nexxo', 'telemetry');
        const files = await fs.readdir(telemetryDir);

        if (files.length !== 1) throw new Error('Telemetry file not created');

        const content = await fs.readFile(path.join(telemetryDir, files[0]), 'utf-8');
        const session = JSON.parse(content);

        if (!session.success) throw new Error('Session success mismatch');
        if (session.metrics.modules !== 10) throw new Error('Metrics mismatch');
        if (session.errors[0] !== 'Error 1') throw new Error('Errors mismatch');
        if (session.duration < 100) throw new Error('Duration too short');

        console.log('✅ Telemetry verification passed');
        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
