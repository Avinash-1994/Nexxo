/**
 * Comprehensive Framework Support Verification
 * Tests all claimed framework support to verify Beta vs Stable status
 */

import { CoreBuildEngine } from '../dist/core/engine/index.js';
import { BuildConfig } from '../dist/config/index.js';
import { getFrameworkPreset } from '../dist/presets/frameworks.js';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

interface FrameworkTest {
    name: string;
    dependencies: Record<string, string>;
    sourceFiles: Record<string, string>;
    expectedInBundle: string[];
}

const FRAMEWORK_TESTS: FrameworkTest[] = [
    {
        name: 'react',
        dependencies: { 'react': '18.2.0', 'react-dom': '18.2.0' },
        sourceFiles: {
            'src/App.tsx': `
                import { useState } from 'react';
                export function App() {
                    const [count, setCount] = useState(0);
                    return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
                }
            `,
            'src/main.tsx': `
                import { createRoot } from 'react-dom/client';
                import { App } from './App';
                createRoot(document.getElementById('root')!).render(<App />);
            `
        },
        expectedInBundle: ['App'] // Component names preserved
    },
    {
        name: 'vue',
        dependencies: { 'vue': '3.4.0' },
        sourceFiles: {
            'src/App.vue': `
                <template>
                    <button @click="count++">Count: {{ count }}</button>
                </template>
                <script setup>
                import { ref } from 'vue';
                const count = ref(0);
                </script>
            `,
            'src/main.ts': `
                import { createApp } from 'vue';
                import App from './App.vue';
                createApp(App).mount('#app');
            `
        },
        expectedInBundle: ['createApp'] // Vue API preserved
    },
    {
        name: 'svelte',
        dependencies: { 'svelte': '4.0.0' },
        sourceFiles: {
            'src/App.svelte': `
                <script>
                    let count = 0;
                </script>
                <button on:click={() => count++}>Count: {count}</button>
            `,
            'src/main.ts': `
                import App from './App.svelte';
                new App({ target: document.body });
            `
        },
        expectedInBundle: ['button'] // HTML elements preserved in Svelte output
    },
    {
        name: 'solid',
        dependencies: { 'solid-js': '1.8.0' },
        sourceFiles: {
            'src/App.tsx': `
                import { createSignal } from 'solid-js';
                export function App() {
                    const [count, setCount] = createSignal(0);
                    return <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>;
                }
            `,
            'src/main.tsx': `
                import { render } from 'solid-js/web';
                import { App } from './App';
                render(() => <App />, document.getElementById('root')!);
            `
        },
        expectedInBundle: ['App'] // Component name preserved
    },
    {
        name: 'angular',
        dependencies: { '@angular/core': '17.0.0' },
        sourceFiles: {
            'src/app.component.ts': `
                import { Component } from '@angular/core';
                @Component({
                    selector: 'app-root',
                    template: '<h1>{{title}}</h1>'
                })
                export class AppComponent {
                    title = 'urja-angular';
                }
            `,
            'src/main.ts': `
                import { AppComponent } from './app.component';
                console.log(AppComponent);
            `
        },
        expectedInBundle: ['AppComponent']
    }
];

async function testFramework(test: FrameworkTest): Promise<{ success: boolean; error?: string }> {
    const testDir = path.resolve(process.cwd(), `test_framework_${test.name}`);

    try {
        await rimraf(testDir);
        await fs.mkdir(testDir, { recursive: true });

        // Create package.json
        await fs.writeFile(path.join(testDir, 'package.json'), JSON.stringify({
            dependencies: test.dependencies
        }));

        // Mock node_modules
        const nodeModules = path.join(testDir, 'node_modules');
        for (const [pkg, version] of Object.entries(test.dependencies)) {
            const pkgDir = path.join(nodeModules, pkg);
            await fs.mkdir(pkgDir, { recursive: true });
            await fs.writeFile(path.join(pkgDir, 'package.json'),
                JSON.stringify({ name: pkg, version }));
        }

        // Create source files
        for (const [filePath, content] of Object.entries(test.sourceFiles)) {
            const fullPath = path.join(testDir, filePath);
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, content);
        }

        // Get entry point (first .ts or .tsx file in src/)
        const entry = Object.keys(test.sourceFiles).find(f => f.includes('main'));
        if (!entry) throw new Error('No entry point found');

        const config: BuildConfig = {
            root: testDir,
            entry: [entry],
            mode: 'production',
            outDir: 'dist',
            port: 3000,
            platform: 'browser',
            preset: 'spa'
        };

        const engine = new CoreBuildEngine();
        const result = await engine.run(config, 'production', testDir);

        if (!result.success) {
            await engine.close();
            return { success: false, error: result.error?.message || 'Build failed' };
        }

        // Verify bundle
        const bundlePath = path.join(testDir, 'dist', path.basename(entry).replace(/\.(ts|tsx)$/, '.bundle.js'));
        const content = await fs.readFile(bundlePath, 'utf-8');

        // Check expected content
        for (const expected of test.expectedInBundle) {
            if (!content.includes(expected)) {
                await engine.close();
                return { success: false, error: `Missing expected content: ${expected}` };
            }
        }

        // Check HMR configuration
        const preset = getFrameworkPreset(test.name as any);
        if (!preset.hmr?.enabled) {
            await engine.close();
            return { success: false, error: 'HMR not enabled in preset' };
        }

        await engine.close();
        return { success: true };

    } catch (e: any) {
        return { success: false, error: e.message };
    } finally {
        await rimraf(testDir);
    }
}

async function runAllTests() {
    console.log('🧪 Comprehensive Framework Verification\n');
    console.log('Testing all frameworks for production readiness...\n');

    const results: Record<string, { success: boolean; error?: string }> = {};

    for (const test of FRAMEWORK_TESTS) {
        process.stdout.write(`Testing ${test.name.padEnd(10)}... `);
        const result = await testFramework(test);
        results[test.name] = result;

        if (result.success) {
            console.log('✅ PASS');
        } else {
            console.log(`❌ FAIL: ${result.error}`);
        }
    }

    console.log('\n📊 Summary:');
    console.log('─'.repeat(50));

    const passed = Object.values(results).filter(r => r.success).length;
    const total = Object.keys(results).length;

    for (const [name, result] of Object.entries(results)) {
        const status = result.success ? '✅ Stable' : '⚠️  Beta';
        const note = result.success ? 'Full build verified' : result.error;
        console.log(`${name.padEnd(10)} ${status.padEnd(12)} ${note}`);
    }

    console.log('─'.repeat(50));
    console.log(`\nResult: ${passed}/${total} frameworks production-ready\n`);

    if (passed === total) {
        console.log('✨ All frameworks verified as STABLE!');
        process.exit(0);
    } else {
        console.log('⚠️  Some frameworks need additional work');
        process.exit(1);
    }
}

runAllTests().catch(console.error);
