import { TelemetryCollector, AnonymizedLearning } from '../src/ai/cloud/telemetry.js';
import { ErrorMemory, LearnedError } from '../src/ai/core/errorMemory.js';
import { FixAction } from '../src/ai/healer/fixer.js';
import { CloudAPI } from '../src/ai/cloud/api.js';
import { DEFAULT_AI_CONFIG } from '../src/ai/config.js';

async function runTest() {
    console.log('🧪 Running Phase 3: Global Learning Network Verification\n');

    try {
        // 1. Anonymization Test
        console.log('Test 1: Privacy-First Anonymization');

        const error: LearnedError = {
            id: 'test-123',
            type: 'missingDep',
            signature: 'sig-abc',
            context: { framework: 'react', configHash: 'hash-xyz' },
            timestamp: Date.now()
        };

        const fix: FixAction = {
            type: 'SHELL_COMMAND',
            description: 'Install react',
            command: 'npm install react',
            confidence: 1
        };

        const anonymized = TelemetryCollector.anonymize(error, fix, true, 1500, 250);

        // Verify NO sensitive data leaked
        if (anonymized.errorSignature.includes('react')) throw new Error('Framework leaked in signature!');
        if (anonymized.fixSignature.includes('npm')) throw new Error('Command leaked in signature!');
        if (!anonymized.anonymized) throw new Error('Not marked as anonymized');

        console.log('✅ No sensitive data in anonymized telemetry');
        console.log(`   Error Signature: ${anonymized.errorSignature.substring(0, 16)}...`);
        console.log(`   Fix Signature: ${anonymized.fixSignature.substring(0, 16)}...`);

        // 2. Cloud API Test (Mock)
        console.log('\nTest 2: Cloud API (Local Mode)');
        const api = new CloudAPI(DEFAULT_AI_CONFIG);

        const response = await api.uploadLearnings([anonymized]);
        if (response.modelVersion !== 'local') throw new Error('Should be in local mode');
        console.log('✅ Cloud API respects local mode');

        const patterns = await api.downloadPatterns();
        if (patterns.length !== 0) throw new Error('Should return empty in local mode');
        console.log('✅ Download returns empty in local mode');

        console.log('\n✨ All Phase 3 tests passed!');
        console.log('\n📝 Note: Cloud provider integration is architecture-ready but not connected.');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
