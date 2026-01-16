import path from 'path';
import fs from 'fs';
import { FrameworkPipeline } from '../core/pipeline/framework-pipeline.js';
import { BuildConfig } from '../config/index.js';
import { log } from '../utils/logger.js';

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/determinism_app');
const RUNS = 5;

// Suppress logs
const originalInfo = log.info;
const originalSuccess = log.success;
const originalWarn = log.warn;

function silenceLogs() {
    log.info = () => { };
    log.success = () => { };
}

function restoreLogs() {
    log.info = originalInfo;
    log.success = originalSuccess;
}

async function setupFixture() {
    if (fs.existsSync(FIXTURE_DIR)) {
        try { fs.rmSync(FIXTURE_DIR, { recursive: true, force: true }); } catch (e) { }
    }
    fs.mkdirSync(path.join(FIXTURE_DIR, 'src'), { recursive: true });

    fs.writeFileSync(path.join(FIXTURE_DIR, 'package.json'), JSON.stringify({
        name: 'determinism-test',
        type: "module",
        dependencies: { react: '18.2.0' }
    }));

    fs.writeFileSync(path.join(FIXTURE_DIR, 'src/index.ts'), `
        import React from 'react';
        export const App = () => React.createElement('div', null, 'Hello World');
    `);
}

async function runDeterminismCheck() {
    console.log(`⚡ Starting Determinism Check (RUNS=${RUNS})...`);
    silenceLogs();

    try {
        await setupFixture();

        const fingerprints: string[] = [];
        const artifactHashes: string[] = [];

        for (let i = 0; i < RUNS; i++) {
            const config: BuildConfig = {
                root: FIXTURE_DIR,
                entry: ['src/index.ts'],
                mode: 'production',
                cache: false,
                logLevel: 'error',
                build: {
                    sourceMaps: true,
                    minify: true
                }
            };

            const pipeline = await FrameworkPipeline.auto(config);
            const result = await pipeline.build();

            if (!result.success) {
                throw new Error(`Build ${i + 1} failed: ${(result as any).error?.message}`);
            }

            const resultTyped = result as any;
            const mainTarget = resultTyped.targets?.[0];
            if (!mainTarget) throw new Error('No targets returned from build');

            let fp = mainTarget.fingerprint;
            const artifacts = mainTarget.artifacts || [];

            await pipeline.close();

            if (!fp) throw new Error('No fingerprint returned from build target');

            if (typeof fp === 'string') {
                try { fp = JSON.parse(fp); } catch (e) { }
            }
            if (typeof fp === 'object' && fp) {
                delete (fp as any).buildTime;
            }
            const fpString = JSON.stringify(fp);

            // Use a.id for content hash
            const combinedHash = artifacts.map((a: any) => `${a.fileName}:${a.id || 'noid'}`).sort().join('|');

            const fpDisplay = (fpString).substring(0, 15);
            process.stdout.write(`  Run ${i + 1}: FP=${fpDisplay}... Artifacts=${artifacts.length} Hash=${combinedHash.substring(0, 10)}... \r`);

            fingerprints.push(fpString);
            artifactHashes.push(combinedHash);

            await new Promise(r => setTimeout(r, 100));
        }

        console.log('\nVerifying consistency...');

        const firstFp = fingerprints[0];
        const firstHash = artifactHashes[0];

        const mismatchFp = fingerprints.findIndex(f => f !== firstFp);

        if (mismatchFp !== -1) {
            console.error(`❌ Fingerprint mismatch at run ${mismatchFp + 1}`);
            console.error(`First FP: ${firstFp}`);
            console.error(`Run ${mismatchFp + 1} FP: ${fingerprints[mismatchFp]}`);

            // Check if it's hash mismatch
            console.error(`First Hash: ${firstHash}`);
            console.error(`Run ${mismatchFp + 1} Hash: ${artifactHashes[mismatchFp]}`);
            process.exit(1);
        }

        const mismatchHash = artifactHashes.findIndex(h => h !== firstHash);
        if (mismatchHash !== -1) {
            console.error(`❌ Artifact Hash mismatch at run ${mismatchHash + 1}`);
            console.error(`First: ${firstHash}`);
            console.error(`Run ${mismatchHash + 1}: ${artifactHashes[mismatchHash]}`);
            process.exit(1);
        }

        console.log(`✅ Determinism Verified across ${RUNS} runs.`);
        fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });

    } finally {
        restoreLogs();
    }
}

runDeterminismCheck().catch(e => {
    restoreLogs();
    console.error('Fatal Error:', e);
    process.exit(1);
});
