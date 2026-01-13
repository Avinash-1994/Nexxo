
/**
 * Module 3: Elite DX - Create-Nexxo Test
 * Validates Day 17 Template Generation
 */

import * as fs from 'fs';
import * as path from 'path';
import { main } from '../src/create-nexxo/cli.js'; // We might need to mock process.argv

const TEST_DIR = path.resolve('.test_create_nexxo');
const PROJ_NAME = 'my-react-app';

async function setup() {
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function cleanup() {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
}

async function runTest() {
    console.log('🧪 Testing create-nexxo CLI...');
    await setup();

    // Mock Process Args
    const originalArgv = process.argv;
    const originalCwd = process.cwd();

    try {
        process.chdir(TEST_DIR);
        process.argv = ['node', 'cli.js', PROJ_NAME, '--template', 'react'];

        const start = performance.now();
        await main();
        const time = performance.now() - start;

        console.log(`  Generation Time: ${time.toFixed(2)}ms`);

        // Check Files
        const projDir = path.join(TEST_DIR, PROJ_NAME);
        if (!fs.existsSync(projDir)) throw new Error('Project directory not created');

        const pkgJson = JSON.parse(fs.readFileSync(path.join(projDir, 'package.json'), 'utf-8'));
        if (!pkgJson.dependencies.react) throw new Error('React dependency missing');

        if (!fs.existsSync(path.join(projDir, 'src/main.tsx'))) throw new Error('main.tsx missing');
        if (!fs.existsSync(path.join(projDir, 'nexxo.config.ts'))) throw new Error('Config missing');

        console.log('  ✅ React Template Verified');

        if (time > 1000) throw new Error('Generation took too long');

    } finally {
        // Restore
        process.argv = originalArgv;
        process.chdir(originalCwd);
        await cleanup();
    }

    console.log('---------------------------');
    console.log('🎉 Day 17 Templates Verified!');
}

runTest().catch(e => {
    console.error('❌ Template Test Failed:', e);
    process.exit(1);
});
