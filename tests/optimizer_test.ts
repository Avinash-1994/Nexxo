import { Analyzer } from '../src/ai/optimizer/analyzer.js';
import { OptimizerEngine } from '../src/ai/optimizer/engine.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running AI Optimizer Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_opt');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    try {
        // Setup: Create React + Tailwind project
        await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify({
            dependencies: {
                'react': '^18.0.0'
            },
            devDependencies: {
                'tailwindcss': '^3.0.0',
                'typescript': '^5.0.0'
            }
        }));
        await fs.writeFile(path.join(testDir, 'tsconfig.json'), '{}');

        // Test 1: Analyzer
        console.log('Test 1: Project Analysis');
        const analyzer = new Analyzer(testDir);
        const profile = await analyzer.analyze();

        if (profile.framework !== 'react') throw new Error('Failed to detect React');
        if (profile.language !== 'typescript') throw new Error('Failed to detect TypeScript');

        console.log('✅ Analysis correct');

        // Test 2: Engine Suggestions
        console.log('\nTest 2: Optimization Suggestions');
        const suggestions = OptimizerEngine.suggest(profile);

        const hasReactSplit = suggestions.some(s => s.id === 'react-split');
        const hasTailwindPurge = suggestions.some(s => s.id === 'tailwind-purge');
        const hasTsStrict = suggestions.some(s => s.id === 'ts-strict');

        if (!hasReactSplit) throw new Error('Missing React splitting suggestion');
        if (!hasTailwindPurge) throw new Error('Missing Tailwind purge suggestion');
        if (!hasTsStrict) throw new Error('Missing TS strict suggestion');

        console.log('✅ Suggestions generated correctly');
        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
