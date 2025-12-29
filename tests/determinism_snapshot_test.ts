
import { CoreBuildEngine } from '../src/core/engine/index.js';
import { BuildConfig } from '../src/config/index.js';
import path from 'path';
import fs from 'fs/promises';
import { strict as assert } from 'assert';
import { canonicalHash } from '../src/core/engine/hash.js';

const TEST_DIR = path.resolve(process.cwd(), 'tests/snapshot_test_dir');
const SNAPSHOT_FILE = path.resolve(process.cwd(), 'tests/v1-core-snapshot.json');

async function setup() {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });
}

async function createStaticProject() {
    await fs.writeFile(path.join(TEST_DIR, 'index.js'), `
        import { hello } from './lib.js';
        import './style.css';
        console.log(hello);
    `);
    await fs.writeFile(path.join(TEST_DIR, 'lib.js'), `
        export const hello = 'world';
    `);
    await fs.writeFile(path.join(TEST_DIR, 'style.css'), `
        .body { color: red; }
    `);
}

async function runSnapshotTest() {
    console.log('--- Urja Determinism Snapshot Test ---');
    await setup();
    await createStaticProject();

    const engine = new CoreBuildEngine();
    const config: BuildConfig = {
        root: TEST_DIR,
        entry: ['index.js'],
        mode: 'production',
        outDir: 'dist',
        port: 0,
        platform: 'browser',
        preset: 'spa'
    };

    const result = await engine.run(config, 'build', TEST_DIR);
    if (!result.success || !result.fingerprint) {
        console.error('Build failed or no fingerprint', result.error);
        process.exit(1);
    }

    const currentSnapshot = {
        inputHash: result.fingerprint.inputHash,
        graphHash: result.fingerprint.graphHash,
        planHash: result.fingerprint.planHash,
        outputHash: result.fingerprint.outputHash,
        artifactCount: result.artifacts?.length || 0,
        // We hash the plan to ensure any semantic change in planning fails the test
        planHashContent: canonicalHash(result.events.filter(e => e.stage === 'plan'))
    };

    const snapshotExists = await fs.access(SNAPSHOT_FILE).then(() => true).catch(() => false);

    if (!snapshotExists) {
        console.log('No snapshot found. Generating initial v1 snapshot...');
        await fs.writeFile(SNAPSHOT_FILE, JSON.stringify(currentSnapshot, null, 2));
        console.log('Snapshot generated at:', SNAPSHOT_FILE);
        return;
    }

    const existingSnapshot = JSON.parse(await fs.readFile(SNAPSHOT_FILE, 'utf-8'));

    console.log('Comparing current build against v1 snapshot...');

    try {
        assert.equal(currentSnapshot.inputHash, existingSnapshot.inputHash, 'Input Hash Mismatch');
        assert.equal(currentSnapshot.graphHash, existingSnapshot.graphHash, 'Graph Hash Mismatch - Core Semantics Drifted!');
        assert.equal(currentSnapshot.planHash, existingSnapshot.planHash, 'Plan Hash Mismatch - Planning Logic Changed!');
        assert.equal(currentSnapshot.artifactCount, existingSnapshot.artifactCount, 'Artifact Count Mismatch');

        console.log('✅ Success: No semantic drift detected. Core is stable.');
    } catch (err: any) {
        console.error('❌ FAILURE: Core Semantic Drift Detected!');
        console.error(err.message);
        console.error('Expected:', existingSnapshot);
        console.error('Actual:', currentSnapshot);
        process.exit(1);
    } finally {
        await fs.rm(TEST_DIR, { recursive: true, force: true });
    }
}

runSnapshotTest().catch(err => {
    console.error(err);
    process.exit(1);
});
