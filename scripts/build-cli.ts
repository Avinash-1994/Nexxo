import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

async function bundleCLI() {
    console.log('🚀 Bundling Nexxo CLI for production performance...');
    const start = performance.now();

    // Everything in dependencies should be external for a clean CLI bundle
    const external = [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}).filter(d => !d.startsWith('@types/')),
        'fsevents',
        './nexxo_native.node'
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
                js: `import { createRequire as __nexxo_createRequire } from 'module';
const require = __nexxo_createRequire(import.meta.url);
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

    } catch (e) {
        console.error('❌ CLI Bundling failed:', e);
        process.exit(1);
    }
}

bundleCLI();
