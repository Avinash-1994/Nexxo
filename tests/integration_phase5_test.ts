import { Telemetry } from '../src/ai/telemetry.js';
import { DashboardCLI } from '../src/ai/dashboard/cli.js';
import { ChatCLI } from '../src/ai/chat/cli.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running AI Phase 5 Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_p5');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    try {
        // Setup: Create dummy telemetry
        console.log('Test 1: Dashboard Data Retrieval');
        const telemetryDir = path.join(testDir, '.urja', 'telemetry');
        await fs.mkdir(telemetryDir, { recursive: true });

        for (let i = 0; i < 5; i++) {
            const session = {
                id: `session-${i}`,
                timestamp: Date.now() - i * 1000,
                duration: 1000,
                success: i % 2 === 0,
                metrics: { modules: 10 + i }
            };
            await fs.writeFile(
                path.join(telemetryDir, `session-${session.timestamp}.json`),
                JSON.stringify(session)
            );
        }

        const sessions = await Telemetry.getSessions(testDir, 3);
        if (sessions.length !== 3) throw new Error(`Expected 3 sessions, got ${sessions.length}`);
        if (sessions[0].id !== 'session-0') throw new Error('Incorrect sort order');

        console.log('✅ Telemetry.getSessions works');

        // Test 2: Dashboard CLI (Mock console.log)
        console.log('\nTest 2: Dashboard CLI Output');
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));

        await DashboardCLI.show(testDir);

        console.log = originalLog;

        if (!logs.some(l => l.includes('📊 Build History'))) throw new Error('Missing dashboard header');
        if (!logs.some(l => l.includes('session-'))) throw new Error('Missing session row');

        console.log('✅ Dashboard CLI output verified');

        // Test 3: Chat CLI (Mock input/output)
        // ChatCLI is interactive, so we'll just verify it can be instantiated and imported
        // Real interactive testing is hard in this environment.
        console.log('\nTest 3: Chat CLI Import');
        if (!ChatCLI) throw new Error('ChatCLI not exported');
        console.log('✅ ChatCLI module verified');

        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
