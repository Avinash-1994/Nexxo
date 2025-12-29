
import { CoreBuildEngine } from '../../src/core/engine/index.js';
import { BuildConfig } from '../../src/config/index.js';
import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';

async function run() {
    console.log('🚀 Starting Cross-Machine Bit-for-Bit Verification');

    // Use two different paths to simulate different machines
    const root1 = path.resolve('validation/cross-machine/machine-a');
    const root2 = path.resolve('validation/cross-machine/machine-b');

    async function setupProject(rootDir: string) {
        await fs.mkdir(rootDir, { recursive: true });
        await fs.mkdir(path.join(rootDir, 'src'), { recursive: true });
        await fs.writeFile(path.join(rootDir, 'src/main.js'), `import { hello } from './lib'; console.log(hello);`);
        await fs.writeFile(path.join(rootDir, 'src/lib.js'), `export const hello = "Machine Independent Content";`);
    }

    await setupProject(root1);
    await setupProject(root2);

    const config: BuildConfig = {
        entry: ['src/main.js'],
        outDir: 'dist',
        plugins: [],
        build: { minify: false, sourcemap: 'none' }
    } as any;

    const engine1 = new CoreBuildEngine();
    const engine2 = new CoreBuildEngine();

    console.log('🏗️ Building in Machine A (path: machine-a)...');
    const res1 = await engine1.run(config, 'production', root1);
    assert.ok(res1.success, 'Build A failed');

    console.log('🏗️ Building in Machine B (path: machine-b)...');
    const res2 = await engine2.run(config, 'production', root2);
    assert.ok(res2.success, 'Build B failed');

    console.log('🔍 Comparing hashes and artifacts...');

    // 1. Compare Output Hashes
    console.log(`Machine A Output Hash: ${res1.fingerprint?.outputHash}`);
    console.log(`Machine B Output Hash: ${res2.fingerprint?.outputHash}`);

    assert.strictEqual(
        res1.fingerprint?.outputHash,
        res2.fingerprint?.outputHash,
        '❌ FAILURE: Output Hash Mismatch between different paths! Determinism is broken.'
    );

    // 2. Compare Bundle Content
    const bundle1 = await fs.readFile(path.join(root1, 'dist/main.bundle.js'), 'utf-8');
    const bundle2 = await fs.readFile(path.join(root2, 'dist/main.bundle.js'), 'utf-8');

    // Remove any non-essential variation (though there shouldn't be any)
    assert.strictEqual(bundle1, bundle2, '❌ FAILURE: Bundle contents are not bit-for-bit identical!');

    console.log('✅ Success: Cross-machine bit-for-bit identity verified.');

    // Cleanup
    await fs.rm('validation/cross-machine', { recursive: true, force: true });
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
