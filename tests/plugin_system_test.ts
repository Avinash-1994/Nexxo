
import { PluginManager, JSPluginSandbox, PluginValidator } from '../src/core/plugins/index.js';
import { strict as assert } from 'assert';

async function runTests() {
    console.log('--- Starting Plugin System Verification (Module 6) ---');

    const manager = new PluginManager();
    const validator = new PluginValidator();

    console.log('[Test 1] JS Plugin Registration & Sandbox');
    const jsPluginCode = `
    const plugin = {
      transformModule: (input) => {
        return input + '\\n// Transformed by JS Plugin';
      }
    };
  `;

    const manifest = {
        name: 'test-plugin',
        version: '1.0.0',
        engineVersion: '1.0.0',
        type: 'js' as const,
        hooks: ['transformModule' as const],
        permissions: {}
    };

    const plugin = new JSPluginSandbox(jsPluginCode, manifest);
    await manager.register(plugin);

    const result = await manager.runHook('transformModule', 'console.log("hello");');
    assert.ok(result.includes('Transformed by JS Plugin'));
    console.log('✅ JS Plugin successfully transformed input in sandbox.');

    console.log('[Test 2] Plugin Validation (Determinism)');
    const validation = await validator.validate(plugin, 'transformModule', 'input');
    assert.strictEqual(validation.passesDeterminism, true);
    console.log('✅ Plugin passed determinism validation.');

    console.log('[Test 3] Nondeterministic Plugin Detection');
    const badPluginCode = `
    const plugin = {
      transformModule: (input) => {
        return input + Math.random();
      }
    };
  `;
    const badPlugin = new JSPluginSandbox(badPluginCode, { ...manifest, name: 'bad-plugin' });
    const badValidation = await validator.validate(badPlugin, 'transformModule', 'input');
    assert.strictEqual(badValidation.passesDeterminism, false);
    console.log('✅ Correctly detected nondeterministic plugin.');

    console.log('--- All Plugin System Tests Passed! ---');
}

runTests().catch(e => {
    console.error('Verification Failed:', e);
    process.exit(1);
});
