import { ReportGenerator } from '../src/ai/reporter/generator.js';
import { Telemetry } from '../src/ai/telemetry.js';
import { BuildSession } from '../src/ai/schema.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running AI Reporter Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_rep');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    try {
        // Test 1: Generate Report
        console.log('Test 1: Report Generation');
        const session: BuildSession = {
            id: 'test-id',
            timestamp: Date.now(),
            duration: 6000,
            success: true,
            metrics: {
                modules: 50,
                bundleSize: 2000000, // ~2MB
                cacheHits: 10
            },
            errors: [],
            warnings: []
        };

        const report = ReportGenerator.generate(session);
        console.log('Generated Report:\n', report);

        if (!report.includes('✅ SUCCESS')) throw new Error('Missing success status');
        if (!report.includes('6.00s')) throw new Error('Incorrect duration format');
        if (!report.includes('1.91 KB') && !report.includes('1953.13 KB') && !report.includes('1.91 MB')) {
            // 2000000 / 1024 = 1953.125 KB. 
            // The generator does (size / 1024).toFixed(2) -> 1953.13 KB
            if (!report.includes('1953.13 KB')) throw new Error('Incorrect bundle size format');
        }
        if (!report.includes('🐢 Build took longer than 5s')) throw new Error('Missing slow build insight');
        if (!report.includes('📦 Bundle is large')) throw new Error('Missing large bundle insight');

        console.log('✅ Report content verified');

        // Test 2: Telemetry Retrieval
        console.log('\nTest 2: Telemetry Retrieval');
        const telemetryDir = path.join(testDir, '.urja', 'telemetry');
        await fs.mkdir(telemetryDir, { recursive: true });

        const filename = `session-${session.timestamp}.json`;
        await fs.writeFile(path.join(telemetryDir, filename), JSON.stringify(session));

        const retrieved = await Telemetry.getLatestSession(testDir);
        if (!retrieved) throw new Error('Failed to retrieve session');
        if (retrieved.id !== session.id) throw new Error('Session ID mismatch');

        console.log('✅ Telemetry retrieval verified');
        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
