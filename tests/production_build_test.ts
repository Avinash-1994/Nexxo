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

        // Verify Output
        const distDir = path.join(testDir, 'dist');
        const distFiles = await fs.readdir(distDir);
        console.log('Dist Files:', distFiles);

        // Should have main.bundle.js
        if (distFiles.includes('main.bundle.js')) {
            console.log('✅ Main bundle created');
        } else {
            throw new Error('Main bundle not found');
        }

        // Should have manifest
        if (distFiles.includes('build-manifest.json')) {
            console.log('✅ Build manifest created');
        } else {
            throw new Error('Build manifest not found');
        }

        // Should have compressed versions
        if (distFiles.some(f => f.endsWith('.gz')) && distFiles.some(f => f.endsWith('.br'))) {
            console.log('✅ Compression verified (gzip + brotli)');
        } else {
            console.log('⚠️  Compression files not found (optional)');
        }

        console.log('\n✨ All tests passed!');
        process.exit(0);

    } catch (e) {
        console.error('❌ Test failed:', e);
        process.exit(1);
    }
}

runTest().catch(console.error);
