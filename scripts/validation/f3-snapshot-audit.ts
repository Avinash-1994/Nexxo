
import { CoreBuildEngine } from '../../src/core/engine/index.js';
import { BuildConfig } from '../../src/config/index.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import assert from 'assert';

import { normalizePath } from '../../src/resolve/utils.js';

async function setupProject(rootDir: string, framework: 'react' | 'vue' | 'svelte') {
    await fs.mkdir(rootDir, { recursive: true });
    await fs.mkdir(path.join(rootDir, 'src'), { recursive: true });

    if (framework === 'react') {
        await fs.writeFile(path.join(rootDir, 'src/main.tsx'), `
            import React from 'react';
            import App from './App';
            console.log(App);
        `);
        await fs.writeFile(path.join(rootDir, 'src/App.tsx'), `
            export default function App() { return <div>Hello</div>; }
        `);
    } else if (framework === 'vue') {
        await fs.writeFile(path.join(rootDir, 'src/main.js'), `
            import { createApp } from 'vue';
            import App from './App.vue';
            createApp(App).mount('#app');
        `);
        await fs.writeFile(path.join(rootDir, 'src/App.vue'), `
            <template><div>Vue</div></template>
        `);
    } else if (framework === 'svelte') {
        await fs.writeFile(path.join(rootDir, 'src/main.js'), `
            import App from './App.svelte';
            const app = new App({ target: document.body });
        `);
        await fs.writeFile(path.join(rootDir, 'src/App.svelte'), `
            <h1>Svelte</h1>
        `);
    }
}

async function runSnapshot(framework: 'react' | 'vue' | 'svelte') {
    const rawRootDir = path.resolve(`validation/snapshots/${framework}`);
    const rootDir = normalizePath(rawRootDir); // Normalize to match graph internal format

    await fs.rm(rawRootDir, { recursive: true, force: true });
    await setupProject(rawRootDir, framework);

    const config: BuildConfig = {
        entry: [framework === 'react' ? 'src/main.tsx' : 'src/main.js'],
        outDir: 'dist',
        plugins: [],
        preset: 'spa'
    } as any;

    const engine = new CoreBuildEngine();
    const result = await engine.run(config, 'production', rawRootDir); // Run with raw path, engine handles normalization
    assert.ok(result.success, `${framework} build failed`);

    const graph = (engine as any).latestGraph;

    // Helper for cross-platform relative paths
    const getRelative = (from: string, to: string) => {
        const rel = path.relative(from, to);
        return rel.split(path.sep).join('/');
    };

    // Sort nodes and edges for deterministic comparison
    const nodes = Array.from(graph.nodes.values()).map((n: any) => ({
        type: n.type,
        path: getRelative(rootDir, n.path),
        edges: n.edges.map((e: any) => {
            const targetNode = Array.from(graph.nodes.values()).find((node: any) => node.id === e.to) as any;
            return {
                kind: e.kind,
                toPath: getRelative(rootDir, targetNode?.path || 'unknown')
            };
        }).sort((a: any, b: any) => a.toPath.localeCompare(b.toPath))
    })).sort((a: any, b: any) => a.path.localeCompare(b.path));

    const baselinePath = path.resolve(`tests/baselines/${framework}.graph.json`);
    const currentData = JSON.stringify(nodes, null, 2);

    if (!existsSync(baselinePath)) {
        console.log(`🆕 Generating baseline for ${framework}...`);
        await fs.writeFile(baselinePath, currentData);
    } else {
        console.log(`🔍 Comparing ${framework} against baseline...`);
        const baseline = await fs.readFile(baselinePath, 'utf-8');
        if (baseline !== currentData) {
            console.error(`❌ FAILURE: ${framework} graph semantic mismatch!`);
            // await fs.writeFile(baselinePath + '.actual', currentData); // For diffing
            process.exit(1);
        } else {
            console.log(`✅ ${framework} graph is stable.`);
        }
    }
}

async function main() {
    console.log('🏁 Starting Snapshot Stability Audit');
    await runSnapshot('react');
    await runSnapshot('vue');
    await runSnapshot('svelte');
    console.log('🎉 Snapshot Stability Audit PASSED');

    // Cleanup
    await fs.rm('validation/snapshots', { recursive: true, force: true });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
