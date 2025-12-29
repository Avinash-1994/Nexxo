
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { strict as assert } from 'assert';

async function run() {
    console.log('🚀 Starting Rollup Plugin Stress Test');
    const rootDir = path.resolve(process.cwd(), 'validation/rollup-compat');
    const cliPath = path.resolve(process.cwd(), 'dist/cli.js');

    // 1. Install dependencies (if not already there)
    const { existsSync } = await import('fs');
    if (!existsSync(path.join(rootDir, 'node_modules'))) {
        console.log('📦 Installing dependencies in validation/rollup-compat...');
        execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    }

    // 2. Run Build
    console.log('🏗️ Running urja build with @rollup/plugin-alias...');
    execSync(`node ${cliPath} build`, { cwd: rootDir, stdio: 'inherit' });

    // 2. Verify Artifacts
    console.log('🔍 Verifying artifacts...');
    const outputDir = path.join(rootDir, 'build_output');

    const bundlePath = path.join(outputDir, 'main.bundle.js');
    const content = await fs.readFile(bundlePath, 'utf-8');

    // If alias worked, 'add(1, 2)' should be in the bundle and resolved to the math.js content
    assert.ok(content.includes('Result:'), 'Bundle does not contain main.js entry code');
    // We check for the hash that was logged by the linker or just that math.js logic is present
    assert.ok(content.includes('a + b'), 'Alias failed! Math.js content (a + b) missing from bundle.');
    // Check that @utils/math was replaced
    assert.ok(!content.includes('@utils/math'), 'Alias string @utils/math should have been replaced by linker');

    console.log('✅ Rollup Plugin Stress Test (Alias): PASSED');
}

run().catch(e => {
    console.error('❌ Rollup Plugin Stress Test: FAILED');
    console.error(e);
    process.exit(1);
});
