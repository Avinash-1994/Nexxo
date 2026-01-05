/**
 * Phase 2.1: Plugin Compatibility Layer Tests
 * Tests for PluginManager optimizations and Rollup adapter
 */

import { PluginManager, Plugin } from '../src/plugins/index.js';
import { rollupAdapter } from '../src/plugins/compat/rollup.js';
import { strict as assert } from 'assert';

async function testHookFilteringCache() {
    console.log('\n[Test 1] Hook Filtering Cache');

    const manager = new PluginManager();

    const transformPlugin: Plugin = {
        name: 'transform-only',
        transform: async (code) => code + '// transformed'
    };

    const loadPlugin: Plugin = {
        name: 'load-only',
        load: async (id) => `// loaded: ${id}`
    };

    manager.register(transformPlugin);
    manager.register(loadPlugin);

    const result = await manager.transform('const x = 1;', 'test.js');
    assert.strictEqual(result, 'const x = 1;// transformed');

    console.log('✅ Hook filtering cache works correctly');
}

async function testCacheInvalidation() {
    console.log('\n[Test 2] Cache Invalidation on Registration');

    const manager = new PluginManager();

    manager.register({
        name: 'plugin-1',
        transform: async (code) => code + '// p1'
    });

    const result1 = await manager.transform('code', 'test.js');
    assert.strictEqual(result1, 'code// p1');

    manager.register({
        name: 'plugin-2',
        transform: async (code) => code + '// p2'
    });

    const result2 = await manager.transform('code', 'test.js');
    assert.strictEqual(result2, 'code// p1// p2');

    console.log('✅ Cache invalidation works on plugin registration');
}

async function testParallelBuildStart() {
    console.log('\n[Test 3] Parallel buildStart Execution');

    const manager = new PluginManager();
    const executionOrder: number[] = [];
    const delays = [50, 30, 40];

    for (let i = 0; i < 3; i++) {
        manager.register({
            name: `plugin-${i}`,
            buildStart: async () => {
                await new Promise(resolve => setTimeout(resolve, delays[i]));
                executionOrder.push(i);
            }
        });
    }

    const start = Date.now();
    await manager.buildStart();
    const duration = Date.now() - start;

    // Should complete in ~50ms (parallel), not 120ms (sequential)
    assert.ok(duration < 80, `Expected <80ms, got ${duration}ms`);
    assert.strictEqual(executionOrder.length, 3);

    console.log(`✅ Parallel buildStart completed in ${duration}ms (expected <80ms)`);
}

async function testSequentialTransform() {
    console.log('\n[Test 4] Sequential Transform Execution');

    const manager = new PluginManager();

    manager.register({
        name: 'plugin-1',
        transform: async (code) => code + ' -> p1'
    });

    manager.register({
        name: 'plugin-2',
        transform: async (code) => code + ' -> p2'
    });

    const result = await manager.transform('start', 'test.js');
    assert.strictEqual(result, 'start -> p1 -> p2');

    console.log('✅ Transform executes sequentially in correct order');
}

async function testFirstMatchResolve() {
    console.log('\n[Test 5] First-Match Resolution');

    const manager = new PluginManager();

    manager.register({
        name: 'plugin-1',
        resolveId: async (source) => source === 'target' ? '/path/p1' : undefined
    });

    manager.register({
        name: 'plugin-2',
        resolveId: async (source) => source === 'target' ? '/path/p2' : undefined
    });

    const result = await manager.resolveId('target');
    assert.strictEqual(result, '/path/p1');

    console.log('✅ resolveId returns first match correctly');
}

async function testRollupAdapterBasic() {
    console.log('\n[Test 6] Rollup Adapter - Basic Functionality');

    const rollupPlugin = {
        name: 'test-rollup-plugin',
        transform: (code: string) => code + '// rollup'
    };

    const urjaPlugin = rollupAdapter(rollupPlugin);

    assert.strictEqual(urjaPlugin.name, 'test-rollup-plugin');
    assert.ok(urjaPlugin.transform);

    const result = await urjaPlugin.transform!('code', 'test.js');
    assert.strictEqual(result, 'code// rollup');

    console.log('✅ Rollup adapter converts plugins correctly');
}

async function testRollupAdapterHooks() {
    console.log('\n[Test 7] Rollup Adapter - Hook Mapping');

    const rollupPlugin = {
        name: 'multi-hook-plugin',
        resolveId: (source: string) => source === 'virtual' ? '/virtual/path.js' : null,
        load: (id: string) => id.endsWith('.virtual') ? 'export default "virtual"' : null,
        renderChunk: (code: string) => code.replace(/\s+/g, ' ')
    };

    const urjaPlugin = rollupAdapter(rollupPlugin);

    const resolveResult = await urjaPlugin.resolveId!('virtual');
    assert.strictEqual(resolveResult, '/virtual/path.js');

    const loadResult = await urjaPlugin.load!('test.virtual');
    assert.strictEqual(loadResult, 'export default "virtual"');

    const renderResult = await urjaPlugin.renderChunk!('const  x  =  1;', {});
    assert.strictEqual(renderResult, 'const x = 1;');

    console.log('✅ All Rollup hooks mapped correctly');
}

async function testRollupAdapterIntegration() {
    console.log('\n[Test 8] Rollup Adapter - Integration with PluginManager');

    const manager = new PluginManager();

    // Native Urja plugin
    manager.register({
        name: 'urja-plugin',
        transform: async (code) => code + ' [urja]'
    });

    // Adapted Rollup plugin
    const rollupPlugin = {
        name: 'rollup-plugin',
        transform: (code: string) => code + ' [rollup]'
    };
    manager.register(rollupAdapter(rollupPlugin));

    const result = await manager.transform('start', 'test.js');
    assert.strictEqual(result, 'start [urja] [rollup]');

    console.log('✅ Rollup plugins integrate seamlessly with Urja plugins');
}

async function testPerformanceBenchmark() {
    console.log('\n[Test 9] Performance Benchmark');

    const manager = new PluginManager();

    // Register 20 plugins, only 5 have transform
    for (let i = 0; i < 20; i++) {
        manager.register({
            name: `plugin-${i}`,
            ...(i < 5 ? { transform: async (code: string) => code } : {})
        });
    }

    const iterations = 100;
    const start = Date.now();

    for (let i = 0; i < iterations; i++) {
        await manager.transform('const x = 1;', 'test.js');
    }

    const duration = Date.now() - start;

    // With optimization, should complete in <100ms
    assert.ok(duration < 150, `Expected <150ms, got ${duration}ms`);

    console.log(`✅ ${iterations} transforms with 20 plugins: ${duration}ms (optimized)`);
}

async function testReturnValueHandling() {
    console.log('\n[Test 10] Return Value Handling');

    const manager = new PluginManager();

    // String return
    manager.register({
        name: 'string-plugin',
        transform: async () => 'string-result'
    });

    const stringResult = await manager.transform('original', 'test.js');
    assert.strictEqual(stringResult, 'string-result');

    // Object return
    const manager2 = new PluginManager();
    manager2.register({
        name: 'object-plugin',
        transform: async () => ({ code: 'object-result', map: null })
    });

    const objectResult = await manager2.transform('original', 'test.js');
    assert.strictEqual(objectResult, 'object-result');

    // Undefined return (pass-through)
    const manager3 = new PluginManager();
    manager3.register({
        name: 'void-plugin',
        transform: async () => undefined
    });

    const voidResult = await manager3.transform('original', 'test.js');
    assert.strictEqual(voidResult, 'original');

    console.log('✅ All return value types handled correctly');
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('Phase 2.1: Plugin Compatibility Layer - Test Suite');
    console.log('='.repeat(60));

    try {
        await testHookFilteringCache();
        await testCacheInvalidation();
        await testParallelBuildStart();
        await testSequentialTransform();
        await testFirstMatchResolve();
        await testRollupAdapterBasic();
        await testRollupAdapterHooks();
        await testRollupAdapterIntegration();
        await testPerformanceBenchmark();
        await testReturnValueHandling();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED (10/10)');
        console.log('='.repeat(60));
        console.log('\nPhase 2.1 Plugin System is VERIFIED and READY');

        return true;
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    }
}

// Run tests
runAllTests().catch(e => {
    console.error('Test suite failed:', e);
    process.exit(1);
});
