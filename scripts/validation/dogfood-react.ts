
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { strict as assert } from 'assert';

async function run() {
    const rootDir = path.resolve(process.cwd(), 'validation/react-app');
    const cliPath = path.resolve(process.cwd(), 'dist/cli.js');

    console.log('🚀 Starting Dogfooding Validation: React + Tailwind');

    // 1. Install dependencies (if not already there)
    if (!existsSync(path.join(rootDir, 'node_modules'))) {
        console.log('📦 Installing dependencies in validation/react-app...');
        const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        execSync(`${npmCmd} install`, { cwd: rootDir, stdio: 'inherit' });
    }

    // 2. Run Build
    console.log('🏗️ Running urja build...');
    execSync(`node ${cliPath} build`, { cwd: rootDir, stdio: 'inherit' });

    // 3. Verify Artifacts
    console.log('🔍 Verifying artifacts...');
    const outputDir = path.join(rootDir, 'build_output');

    const manifestPath = path.join(outputDir, 'build-manifest.json');
    const getManifest = async () => JSON.parse(await fs.readFile(manifestPath, 'utf-8'));

    const manifest = await getManifest();

    assert.ok(manifest.artifacts.some((a: any) => a.fileName === 'main.bundle.js'), 'main.bundle.js missing');
    assert.ok(manifest.artifacts.some((a: any) => a.fileName === 'main.bundle.css'), 'main.bundle.css missing');

    // Check for lazy loaded chunks
    assert.ok(manifest.artifacts.some((a: any) => a.fileName.includes('chunk.Home.bundle.js')), 'Home chunk missing');
    assert.ok(manifest.artifacts.some((a: any) => a.fileName.includes('chunk.About.bundle.js')), 'About chunk missing');

    // Check Tailwind Output
    const cssContent = await fs.readFile(path.join(outputDir, 'main.bundle.css'), 'utf-8');
    assert.ok(cssContent.includes('bg-red-500'), 'Tailwind bg-red-500 missing from CSS bundle');
    assert.ok(!cssContent.includes('@tailwind'), 'Tailwind directives were NOT processed');

    // 4. Determinism Check
    console.log('🔄 Checking determinism (2x)...');
    const firstManifest = await getManifest();

    // Re-run build
    execSync(`node ${cliPath} build`, { cwd: rootDir, stdio: 'ignore' });
    const secondManifest = await getManifest();

    // Compare artifacts (ignore timestamp)
    const firstArtifacts = JSON.stringify(firstManifest.artifacts.sort((a: any, b: any) => a.fileName.localeCompare(b.fileName)));
    const secondArtifacts = JSON.stringify(secondManifest.artifacts.sort((a: any, b: any) => a.fileName.localeCompare(b.fileName)));

    assert.equal(firstArtifacts, secondArtifacts, 'Build artifacts are NOT deterministic! Hashes changed.');

    console.log('✅ Dogfooding Validation: PASSED');
}

run().catch(e => {
    console.error('❌ Dogfooding Validation: FAILED');
    console.error(e);
    process.exit(1);
});
