
import { detectFramework } from '../src/core/detection/index.js';
import path from 'path';
import fs from 'fs/promises';
import { strict as assert } from 'assert';

const TEST_DIR = path.resolve(process.cwd(), 'tests/temp_detection');

async function setup() {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });
}

async function cleanup() {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
}

async function verify(name: string, setupFn: () => Promise<void>, assertions: (p: any) => void) {
    console.log(`\n[Test] ${name}`);
    await setup();
    await setupFn();
    const profile = await detectFramework(TEST_DIR);
    console.log('Detected:', profile.metaFramework ? `${profile.metaFramework}+${profile.primaryFramework}` : profile.primaryFramework);
    console.log('Score:', profile.confidenceScore);
    assertions(profile);
}

async function runTests() {
    console.log('--- Starting Framework Detection Tests ---');

    await verify('React SPA (Deps Only)', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'package.json'), JSON.stringify({
            dependencies: { 'react': '18.2.0', 'react-dom': '18.2.0' }
        }));
    }, (p) => {
        assert.equal(p.primaryFramework, 'react');
        assert.equal(p.metaFramework, undefined);
        assert.equal(p.rendering.primary, 'spa');
        assert.ok(p.confidenceScore >= 40);
    });

    await verify('Next.js (Deps + FS)', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'package.json'), JSON.stringify({
            dependencies: { 'next': '13.0.0', 'react': '18.2.0' }
        }));
        await fs.mkdir(path.join(TEST_DIR, 'pages'));
    }, (p) => {
        assert.equal(p.primaryFramework, 'react');
        assert.equal(p.metaFramework, 'next');
        assert.equal(p.rendering.primary, 'ssr');
        assert.equal(p.routing, 'file-based');
    });

    await verify('SvelteKit', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'package.json'), JSON.stringify({
            devDependencies: { '@sveltejs/kit': '1.0.0', 'svelte': '3.0.0' }
        }));
        await fs.mkdir(path.join(TEST_DIR, 'src/routes'), { recursive: true });
    }, (p) => {
        assert.equal(p.primaryFramework, 'svelte');
        assert.equal(p.metaFramework, 'sveltekit');
        assert.equal(p.rendering.primary, 'ssr');
        // Wait, 'sveltekit' in meta map implies... logic in resolver says:
        // if (meta || primary === 'astro'...) renderingPrimary = 'ssr'.
        // So it should be 'ssr'.
        assert.equal(p.rendering.primary, 'ssr');
        assert.equal(p.routing, 'file-based');
    });

    await verify('Unknown / Empty', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'package.json'), JSON.stringify({
            dependencies: { 'lodash': '1.0.0' }
        }));
    }, (p) => {
        assert.equal(p.primaryFramework, 'unknown');
        assert.equal(p.confidenceScore, 0);
    });

    await verify('Entry Inspection (React)', async () => {
        await fs.writeFile(path.join(TEST_DIR, 'package.json'), JSON.stringify({
            dependencies: {} // No explicit deps to test signal
        }));
        await fs.mkdir(path.join(TEST_DIR, 'src'));
        await fs.writeFile(path.join(TEST_DIR, 'src/index.tsx'), `
            import { createRoot } from 'react-dom/client';
            createRoot(document.getElementById('root'));
        `);

        // Pass candidate explicitly or rely on default fallback scanning?
        // Index.ts falls back to defaults.
        // We need to overwrite detecting logic in test wrapper? 
        // No, calling detectFramework(TEST_DIR) uses defaults which include src/index.tsx
    }, (p) => {
        assert.equal(p.primaryFramework, 'react');
        assert.ok(p.confidenceScore >= 30);
    });

    await cleanup();
    console.log('\n--- All Detection Tests Passed! ---');
}

runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
