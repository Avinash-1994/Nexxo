import { ErrorParser } from '../src/ai/healer/parser.js';
import { FixGenerator } from '../src/ai/healer/fixer.js';

async function runTest() {
    console.log('🧪 Running Self-Healing Integration Test\n');

    try {
        // Test 1: Missing Dependency
        console.log('Test 1: Missing Dependency');
        const err1 = "Module not found: Error: Can't resolve 'react'";
        const parsed1 = ErrorParser.parse(err1);

        if (parsed1.type !== 'MISSING_DEPENDENCY') throw new Error('Failed to parse missing dep');
        if (parsed1.context.package !== 'react') throw new Error('Failed to extract package name');

        const fixes1 = FixGenerator.generate(parsed1);
        if (fixes1.length === 0) throw new Error('No fixes generated');
        if (!fixes1[0].command?.includes('npm install react')) throw new Error('Incorrect fix command');

        console.log('✅ Missing Dependency parsed & fixed');

        // Test 2: Syntax Error
        console.log('\nTest 2: Syntax Error');
        const err2 = "src/main.ts(10,5): error TS1005: ')' expected.";
        const parsed2 = ErrorParser.parse(err2);

        if (parsed2.type !== 'SYNTAX_ERROR') throw new Error('Failed to parse syntax error');
        if (parsed2.context.line !== 10) throw new Error('Failed to extract line number');

        const fixes2 = FixGenerator.generate(parsed2);
        if (fixes2[0].type !== 'MANUAL_INSTRUCTION') throw new Error('Incorrect fix type');

        console.log('✅ Syntax Error parsed & fixed');

        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
