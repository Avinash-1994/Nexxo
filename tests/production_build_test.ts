import { BundlerStep } from '../src/core/steps.js';
import { BuildConfig } from '../src/config/index.js';
import { PluginManager } from '../src/plugins/index.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

async function runTest() {
    console.log('🧪 Running Production Build Integration Test\n');

    const testDir = path.resolve(process.cwd(), 'test_output_prod');
    await rimraf(testDir);
    await fs.mkdir(testDir, { recursive: true });

    // Create source files with dynamic import
    const srcDir = path.join(testDir, 'src');
    await fs.mkdir(srcDir, { recursive: true });

    await fs.writeFile(path.join(srcDir, 'main.ts'), `
        console.log('Main entry');
        import('./lazy.js').then(m => m.default());
    `);

    await fs.writeFile(path.join(srcDir, 'lazy.ts'), `
        export default function() {
            console.log('Lazy loaded');
        }
    `);

    const config: BuildConfig = {
        root: testDir,
        entry: ['src/main.ts'],
        mode: 'production',
        outDir: 'dist',
        port: 3000,
        platform: 'browser',
        preset: 'spa',
        build: {
            splitting: true,
            targets: ['esm', 'cjs']
        }
    };

    // Mock Context
    const ctx: any = {
        config,
        entryPoints: {
            main: path.join(srcDir, 'main.ts')
        },
        pluginManager: new PluginManager()
    };

    try {
        console.log('Starting bundler...');
        const bundler = new BundlerStep();
        await bundler.run(ctx).catch(e => {
            console.error('Bundler run failed:', e);
            throw e;
        });

        console.log('✅ Build completed');

        // Verify ESM Output (Splitting enabled)
        const esmDir = path.join(testDir, 'dist/esm');
        const esmFiles = await fs.readdir(esmDir);
        console.log('ESM Files:', esmFiles);

        // Should have main.js and a chunk for lazy.js
        if (esmFiles.some(f => f.startsWith('chunk-'))) {
            console.log('✅ ESM Code splitting verified (chunk found)');
        } else {
            // Esbuild might name it lazy.js if it's a direct import, but usually adds hash/chunk name
            // If splitting is on, dynamic imports usually become chunks.
            // Let's check if there are at least 2 js files.
            if (esmFiles.filter(f => f.endsWith('.js')).length >= 2) {
                console.log('✅ ESM Code splitting verified (multiple files)');
            } else {
                throw new Error('ESM Code splitting failed');
            }
        }

        // Verify CJS Output (No splitting usually, or different structure)
        const cjsDir = path.join(testDir, 'dist/cjs');
        const cjsFiles = await fs.readdir(cjsDir);
        console.log('CJS Files:', cjsFiles);

        // CJS usually bundles everything into entry points unless splitting is supported (esbuild supports splitting for cjs now? No, only esm)
        // So we expect main.js. Lazy import might be inline or require.
        // Actually esbuild throws error if splitting=true with format=cjs.
        // Our code disables splitting for cjs.
        // So we expect main.js.
        if (cjsFiles.includes('main.js')) {
            console.log('✅ CJS build verified');
        } else {
            throw new Error('CJS build failed');
        }

        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
