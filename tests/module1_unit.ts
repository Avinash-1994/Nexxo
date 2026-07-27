
/**
 * Module 1: Speed Mastery - Unit Test Suite
 * Validates Day 1-7 implementations
 */

import { bunParser } from '../src/core/parser-bun.js';
import { rolldownBundler } from '../src/core/bundler-rolldown.js';
import { getCacheManager } from '../src/core/cache-manager.js';
import { PersistentBuildCache } from '../src/core/engine/cache.js';
import { HMREngine } from '../src/dev/hmr-v2.js';
// Need to handle native orchestrator import carefully if not exposed
// We'll import the bindings directly if needed, or rely on core engine
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const path = require('path');
const fs = require('fs');

async function testParser() {
    console.log('🧪 Testing Bun Parser...');
    const code = 'const a: number = 1;';
    const res = await bunParser.transform(code, 'test.ts', { isDev: true });
    // Expect: const a = 1; (or similar JS)
    if (!res.code || res.code.includes('number')) {
        throw new Error('Parser failed to strip types');
    }
    console.log('✅ Parser Passed');
}

async function testBundler() {
    console.log('🧪 Testing Rolldown Bundler...');
    const outDir = path.resolve('.test_bundler_out');
    const entry = path.join(outDir, 'entry.js');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(entry, 'export const x = 1;');

    const res = await rolldownBundler.build({
        input: entry,
        outDir,
        format: 'esm'
    });

    if (res.errors.length > 0) throw new Error('Bundler reported errors');
    if (res.files.length === 0) throw new Error('No files generated');

    fs.rmSync(outDir, { recursive: true, force: true });
    console.log('✅ Bundler Passed');
}

async function testCache() {
    console.log('🧪 Testing RocksDB Cache...');
    const root = path.resolve('.test_cache_unit');
    const mgr = getCacheManager(root);

    const key = 'test-key';
    const val = 'test-value';

    mgr.set('transform', key, val);

    // CacheManager.get is asynchronous because it may lazily initialize the native cache.
    const read = await mgr.get('transform', key);

    if (read !== val) throw new Error(`Cache mismatch: Expected ${val}, got ${read}`);

    mgr.close();
    fs.rmSync(root, { recursive: true, force: true });
    console.log('✅ Cache Passed');
}

async function testPersistentBuildCache() {
    console.log('🧪 Testing Persistent Build Cache...');
    const root = path.resolve('.test_persistent_build_cache');
    const buildCache = new PersistentBuildCache(root);

    const key = 'artifact:test-entry';
    const value = { hash: 'artifact-hash', artifact: { id: 'artifact-hash', type: 'js', fileName: 'assets/main.bundle.js', dependencies: [], source: 'console.log("ok")' } };

    await buildCache.set(key, value);
    const loaded = await buildCache.get(key);

    if (!loaded || loaded.hash !== value.hash || loaded.artifact.fileName !== value.artifact.fileName) {
        throw new Error(`Persistent cache lookup failed. Expected ${JSON.stringify(value)}, got ${JSON.stringify(loaded)}`);
    }

    await buildCache.close();
    fs.rmSync(root, { recursive: true, force: true });
    console.log('✅ Persistent Build Cache Passed');
}

async function testHMR() {
    console.log('🧪 Testing Delta HMR Engine...');
    const engine = new HMREngine('/app');

    // A -> B
    // B is self-accepting
    engine.registerModule('/app/B.js', [], true);
    engine.registerModule('/app/A.js', ['/app/B.js'], false);

    const update = engine.propagateUpdate('/app/B.js');

    if (!update || update.type !== 'js-update' || update.acceptedPath !== '/app/B.js') {
        throw new Error(`HMR Propagation failed. Got: ${JSON.stringify(update)}`);
    }

    // Nested bubble up: update should climb through non-accepting modules
    engine.registerModule('/app/Leaf.ts', [], true);
    engine.registerModule('/app/Mid.ts', ['/app/Leaf.ts'], false);
    engine.registerModule('/app/App.ts', ['/app/Mid.ts'], true);

    const nestedUpdate = engine.propagateUpdate('/app/Mid.ts');
    if (!nestedUpdate || nestedUpdate.type !== 'js-update' || nestedUpdate.acceptedPath !== '/app/App.ts') {
        throw new Error(`Nested bubble-up failed. Got: ${JSON.stringify(nestedUpdate)}`);
    }

    // CSS updates should be accepted even without explicit registration.
    const cssUpdate = engine.propagateUpdate('/app/styles.css');
    if (!cssUpdate || cssUpdate.type !== 'css-update' || cssUpdate.acceptedPath !== '/app/styles.css') {
        throw new Error(`CSS HMR failed. Got: ${JSON.stringify(cssUpdate)}`);
    }

    console.log('✅ HMR Passed');
}

async function runTests() {
    try {
        await testParser();
        await testBundler();
        await testCache();
        await testPersistentBuildCache();
        await testHMR();
        // Orchestrator manual test omitted for simplicity, covered by Day 2 verification
        console.log('---------------------------');
        console.log('🎉 All Module 1 Unit Tests Passed!');
    } catch (e: any) {
        console.error('❌ Test Failed:', e.message);
        process.exit(1);
    }
}

runTests();
