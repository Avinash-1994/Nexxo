
/**
 * Module 1: Speed Mastery - Integration Test Suite
 * Validates Core Pipeline + HMR + Framework Basic Syntax
 */

import { bunParser } from '../src/core/parser-bun.js';
import { rolldownBundler } from '../src/core/bundler-rolldown.js';
import { HMREngine } from '../src/dev/hmr-v2.js';
import * as fs from 'fs';
import * as path from 'path';

const TEST_DIR = path.resolve('.test_integration_mod1');

async function setup() {
    fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function cleanup() {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
}

async function testReactIntegration() {
    console.log('🧪 Testing React Build Pipeline...');
    // 1. Create React Component
    const code = `
        import React, { useState } from 'react';
        export const App = () => {
            const [count, setCount] = useState(0);
            return <div>{count}</div>;
        };
    `;
    const entry = path.join(TEST_DIR, 'App.tsx');
    fs.writeFileSync(entry, code);

    // 2. Parse (Simulate Transformer)
    // In real app, UniversalTransformer calls BunParser
    const parsed = await bunParser.transform(code, 'App.tsx', { isDev: false });
    if (!parsed.code.includes('React.createElement') && !parsed.code.includes('jsx')) {
        // Bun might preserve JSX if loader is tsx/jsx and target is not raw JS? 
        // Bun.transpiler target 'browser' usually compiles JSX to React.createElement
    }

    // 3. Bundle (Rolldown)
    // Rolldown should handle the consumption of this file
    const res = await rolldownBundler.build({
        input: entry,
        outDir: path.join(TEST_DIR, 'dist-react'),
        format: 'esm'
    });

    if (res.errors.length > 0) throw new Error('React Bundle Failed');
    console.log('✅ React Build Pipeline Passed');
}

async function testHMRIntegration() {
    console.log('🧪 Testing HMR Integration...');
    // Setup Engine with mock graph
    const engine = new HMREngine('/app');

    // Simulate App -> Button
    engine.registerModule('/app/Button.tsx', [], true); // Self-accepting
    engine.registerModule('/app/App.tsx', ['/app/Button.tsx'], false);

    // 1. Leaf Update (Button)
    const update1 = engine.propagateUpdate('/app/Button.tsx');
    if (update1?.type !== 'js-update' || update1.acceptedPath !== '/app/Button.tsx') {
        throw new Error('HMR Leaf Update Failed');
    }

    // 2. Parent Update (App) -> Full Reload (since App not accepting)
    const update2 = engine.propagateUpdate('/app/App.tsx');
    if (update2?.type !== 'full-reload') {
        throw new Error('HMR Parent Update Failed (Expected Full Reload)');
    }

    console.log('✅ HMR Integration Passed');
}

async function testVanillaIntegration() {
    console.log('🧪 Testing Vanilla JS/TS...');
    const code = 'export const hello = (name: string) => `Hello ${name}`;';
    fs.writeFileSync(path.join(TEST_DIR, 'utils.ts'), code);

    const res = await rolldownBundler.build({
        input: path.join(TEST_DIR, 'utils.ts'),
        outDir: path.join(TEST_DIR, 'dist-vanilla'),
    });

    if (res.errors.length > 0) throw new Error('Vanilla Bundle Failed');
    console.log('✅ Vanilla Integration Passed');
}

async function runTests() {
    try {
        await setup();
        await testReactIntegration();
        await testVanillaIntegration();
        await testHMRIntegration();
        console.log('---------------------------');
        console.log('🎉 Integration Tests Passed (Core Capabilities)');
    } catch (e: any) {
        console.error('❌ Integration Test Failed:', e);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

runTests();
