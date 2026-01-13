
/**
 * Module 2: Zero-Trust Ecosystem - Compat Layer Test
 * Validates Day 11 Adapter Logic
 */

import { CompatPluginAdapter } from '../src/plugins/compat/adapter.js';
import { PluginRuntime } from '../src/plugins/wasm-runtime.js'; // Helper, not Native class directly
// Use a Mock for the runtime interaction since we test the TS logic here

class MockRuntime {
    execute(bytes: Buffer, input: string, timeout: number): string {
        const req = JSON.parse(input);

        // Simulating a WASM plugin that handles 'resolveId'
        if (req.hook === 'resolveId') {
            if (req.args[0] === 'virtual-module') {
                return JSON.stringify({ id: '\0virtual-module' });
            }
        }

        // Simulating 'load'
        if (req.hook === 'load') {
            if (req.args[0] === '\0virtual-module') {
                return JSON.stringify({ code: 'export default "sandboxed";' });
            }
        }

        // Simulating 'transform'
        if (req.hook === 'transform') {
            return JSON.stringify({ code: req.args[0] + '\n// Transformed in WASM' });
        }

        return 'null'; // Void return
    }
}

async function testAdapterFlow() {
    console.log('🧪 Testing Vite/Rollup Compat Adapter...');

    // 1. Setup
    const mockRuntime = new MockRuntime() as unknown as PluginRuntime; // Cast for compatibility
    const adapter = new CompatPluginAdapter(mockRuntime);

    const manifest = { name: 'test-compat' };
    const dummyBytes = Buffer.from([]);

    const plugin = adapter.adapt(manifest, dummyBytes);

    console.log(`  Adapted Plugin: ${plugin.name}`);

    // 2. Test resolveId
    console.log('  Testing resolveId...');
    // @ts-ignore
    const resolved = await plugin.resolveId('virtual-module', undefined);
    if (resolved !== '\0virtual-module') {
        throw new Error(`Resolve failed. Expected \0virtual-module, got ${resolved}`);
    }
    console.log('  ✅ resolveId Mapped');

    // 3. Test load
    console.log('  Testing load...');
    // @ts-ignore
    const loaded = await plugin.load('\0virtual-module');
    if (loaded !== 'export default "sandboxed";') {
        throw new Error('Load failed');
    }
    console.log('  ✅ load Mapped');

    // 4. Test transform
    console.log('  Testing transform...');
    // @ts-ignore
    const transformed = await plugin.transform('console.log(1);', 'file.js');
    // @ts-ignore - transform can return obj or string, adapter returns obj
    if (!transformed || !transformed.code.includes('// Transformed in WASM')) {
        throw new Error('Transform failed');
    }
    console.log('  ✅ transform Mapped');
}

testAdapterFlow();
