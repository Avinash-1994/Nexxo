
import { CoreBuildEngine } from '../src/core/engine/index.js';
import { BuildConfig } from '../src/config/index.js';
import path from 'path';
import fs from 'fs/promises';
import { strict as assert } from 'assert';

const TEST_DIR = path.resolve(process.cwd(), 'tests/temp_core_engine');

async function setup() {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });
}

async function cleanup() {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
}

async function createTestProject() {
    await fs.writeFile(path.join(TEST_DIR, 'entry.js'), `
        import { foo } from './foo.js';
        console.log(foo);
    `);
    await fs.writeFile(path.join(TEST_DIR, 'foo.js'), `
        export const foo = 'bar';
    `);
}

async function runTest() {
    console.log('--- Starting Core Engine Verification Tests ---');
    await setup();
    await createTestProject();

    const engine = new CoreBuildEngine();
    const config: BuildConfig = {
        root: TEST_DIR,
        entry: ['entry.js'],
        mode: 'development',
        outDir: 'dist',
        port: 0,
        platform: 'node',
        preset: 'spa'
    };

    // Test 1: First Build
    console.log('\n[Test 1] Initial Build');
    const result1 = await engine.run(config, 'dev', TEST_DIR);
    if (!result1.success) console.error(result1.error);
    assert.ok(result1.success, 'Build should succeed');
    assert.ok(result1.fingerprint, 'Build should have a fingerprint');
    assert.equal(result1.artifacts?.length, 1, 'Should emit 1 artifact (bundled)');

    // Check output file
    const outfile = path.join(TEST_DIR, 'dist', 'entry.bundle.js');
    const content1 = await fs.readFile(outfile, 'utf-8');
    assert.ok(content1.includes('export const foo = \'bar\';'), 'Output should contain module content');

    // Test 2: Determinism (Same input -> Same output)
    console.log('\n[Test 2] Determinism Check');
    const result2 = await engine.run(config, 'dev', TEST_DIR);
    assert.ok(result2.success);
    assert.equal(result2.fingerprint?.inputHash, result1.fingerprint?.inputHash, 'Input hash must be identical');
    assert.equal(result2.fingerprint?.outputHash, result1.fingerprint?.outputHash, 'Output hash must be identical');
    assert.equal(result2.fingerprint?.planHash, result1.fingerprint?.planHash, 'Plan hash must be identical');

    // Test 3: Sensitivity (Changed input -> Changed output)
    console.log('\n[Test 3] Input Sensitivity Check');
    await fs.writeFile(path.join(TEST_DIR, 'foo.js'), `export const foo = 'baz';`);
    const result3 = await engine.run(config, 'dev', TEST_DIR);

    assert.ok(result3.success);
    assert.notEqual(result3.fingerprint?.inputHash, result1.fingerprint?.inputHash, 'Input hash must change after edit');
    assert.notEqual(result3.fingerprint?.outputHash, result1.fingerprint?.outputHash, 'Output hash must change after edit');

    const content3 = await fs.readFile(outfile, 'utf-8');
    assert.ok(content3.includes('baz'), 'Output should reflect changes');

    // Test 4: Explainability
    console.log('\n[Test 4] Explainability Check');
    const events = result3.events;
    assert.ok(events && events.length > 0, 'Should have explain events');

    const stages = new Set(events.map(e => e.stage));
    assert.ok(stages.has('init'), 'Should have init stage events');
    assert.ok(stages.has('fingerprint'), 'Should have fingerprint stage events');
    assert.ok(stages.has('plan'), 'Should have plan stage events');
    assert.ok(stages.has('execute'), 'Should have execute stage events');
    assert.ok(stages.has('emit'), 'Should have emit stage events');

    // Test 5: Verify Explain Log File
    console.log('\n[Test 5] Explain Log File Check');
    const logPath = path.join(TEST_DIR, 'dist', 'build-explain.json');
    const logExists = await fs.access(logPath).then(() => true).catch(() => false);
    assert.ok(logExists, 'build-explain.json should be created');

    console.log('\n--- All Tests Passed! ---');
    await cleanup();
}

runTest().catch(err => {
    console.error('\n!!! TEST FAILED !!!');
    console.error(err);
    process.exit(1);
});
