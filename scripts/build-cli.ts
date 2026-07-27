import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

async function bundleCLI() {
    console.log('🚀 Bundling Lunx CLI for production performance...');
    const start = performance.now();

    // Everything in dependencies should be external for a clean CLI bundle
    const external = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}).filter(d => !d.startsWith('@types/')),
        'fsevents',
        './lunx_native.node'
    ];

    try {
        const result = await build({
            entryPoints: ['src/cli.ts'],
            bundle: true,
            platform: 'node',
            target: 'node20', // Matches package.json
            outdir: 'dist',
            outExtension: { '.js': '.mjs' },
            format: 'esm',
            splitting: true,
            sourcemap: false,
            minify: true,
            external,

            // Polyfill require for ESM
            banner: {
                js: `import { createRequire as __lunx_createRequire } from 'module';
const require = __lunx_createRequire(import.meta.url);
`,
            },
            logLevel: 'info',
            metafile: true,
        });

        // Make executable
        if (fs.existsSync('dist/cli.mjs')) {
            fs.chmodSync('dist/cli.mjs', '755');
        }

        const duration = (performance.now() - start).toFixed(2);
        console.log(`✅ CLI bundled in ${duration}ms`);
        console.log(`📂 Output: dist/cli.mjs`);

        // Copy native node module to dist for runtime access
        const nativeModulePath = path.resolve(process.cwd(), 'lunx_native.node');
        if (fs.existsSync(nativeModulePath)) {
            fs.copyFileSync(nativeModulePath, path.join(process.cwd(), 'dist/lunx_native.node'));
            console.log('✅ Native module [lunx_native.node] copied to dist/');
        }

    } catch (e) {
        console.error('❌ CLI Bundling failed:', e);
        process.exit(1);
    }
}

bundleCLI();
