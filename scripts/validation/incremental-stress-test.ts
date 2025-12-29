
import { CoreBuildEngine } from '../../src/core/engine/index.js';
import { BuildConfig } from '../../src/config/index.js';
import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';

async function run() {
    console.log('🚀 Starting Incremental Build Stress Test');

    const rootDir = path.resolve('validation/incremental-test');
    await fs.mkdir(rootDir, { recursive: true });
    await fs.mkdir(path.join(rootDir, 'src'), { recursive: true });

    // 1. Setup project
    const mainJs = `import { msg } from './msg'; console.log(msg);`;
    const msgJs = `export const msg = "Hello Version 1";`;
    const otherJs = `export const other = "Unrelated content";`;

    await fs.writeFile(path.join(rootDir, 'src/main.js'), mainJs);
    await fs.writeFile(path.join(rootDir, 'src/msg.js'), msgJs);
    await fs.writeFile(path.join(rootDir, 'src/other.js'), otherJs);

    const config: BuildConfig = {
        entry: ['src/main.js'],
        outDir: 'dist',
        plugins: [],
        build: { minify: false }
    } as any;

    const engine = new CoreBuildEngine();

    // 1.1 Clear cache for determinism
    await engine.run(config, 'dev', rootDir); // Initialize ctx
    (engine as any).ctx.cache.clear();

    // 2. Initial Build
    console.log('🏗️ Running initial build...');
    const start1 = Date.now();
    const result1 = await engine.run(config, 'dev', rootDir);
    const time1 = Date.now() - start1;
    assert.ok(result1.success, 'Initial build failed');
    console.log(`✅ Initial build completed in ${time1}ms`);

    const bundle1 = await fs.readFile(path.join(rootDir, 'dist/main.bundle.js'), 'utf-8');
    assert.ok(bundle1.includes('Hello Version 1'), 'Bundle 1 incorrect');

    // 3. Incremental Build (Change one file)
    console.log('🔄 Modifying msg.js and running incremental build...');
    const msgJsV2 = `export const msg = "Hello Version 2";`;
    await fs.writeFile(path.join(rootDir, 'src/msg.js'), msgJsV2);

    const start2 = Date.now();
    // Pass the changed file explicitly
    const result2 = await engine.run(config, 'dev', rootDir, [path.join(rootDir, 'src/msg.js')]);
    const time2 = Date.now() - start2;
    assert.ok(result2.success, 'Incremental build failed');
    console.log(`✅ Incremental build completed in ${time2}ms`);

    const bundle2 = await fs.readFile(path.join(rootDir, 'dist/main.bundle.js'), 'utf-8');
    assert.ok(bundle2.includes('Hello Version 2'), 'Bundle 2 incorrect');
    assert.ok(!bundle2.includes('Hello Version 1'), 'Bundle 2 still contains old content');

    // 4. Performance Check
    console.log(`📊 Initial: ${time1}ms, Incremental: ${time2}ms`);
    // Incremental should be faster usually, but on small projects it might be close.
    // The key is that it worked correctly.

    // 5. Test Error Boundaries
    console.log('🛡️ Testing Error Boundaries (Simulating plugin failure)...');
    config.plugins!.push({
        manifest: { name: 'crashing-plugin', version: '1.0.0', engineVersion: '1.0.0', type: 'js', hooks: ['transformModule'], permissions: { fs: 'none' } },
        id: 'crashing-plugin',
        async runHook(hook: any) {
            if (hook === 'transformModule') throw new Error('KA-BOOM!');
            return null;
        }
    });

    // Reset context to pick up new plugin
    (engine as any).ctx = null;
    await engine.run(config, 'dev', rootDir); // Init context
    (engine as any).ctx.cache.clear();

    const result3 = await engine.run(config, 'dev', rootDir);
    assert.strictEqual(result3.success, false, 'Build should have failed');
    assert.ok(result3.error?.message.includes('KA-BOOM!'), 'Error message missing crash details');
    assert.strictEqual(result3.error?.code, 'PLUGIN_ERROR', 'Error code should be PLUGIN_ERROR');
    console.log('✅ Error boundary caught the crash correctly!');

    console.log('🎉 All Incremental & Error Boundary tests PASSED!');
}

run().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
