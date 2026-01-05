/**
 * Phase 2.3: Plugin Governance & API Tests
 * Verifies strict typing, validation, and stability levels.
 */

import { PluginManager } from '../src/plugins/index.js';
import { validatePlugin } from '../src/plugins/governance.js';
import { strict as assert } from 'assert';

async function testPluginValidation() {
    console.log('\n[Test 1] Plugin Validation (Advanced)');

    // Valid Plugin
    const valid = validatePlugin({
        name: 'urja-plugin-good',
        stability: 'stable'
    });
    assert.strictEqual(valid.valid, true);
    assert.strictEqual(valid.errors.length, 0);

    // Invalid Plugin (No Name)
    const invalid = validatePlugin({
        stability: 'stable'
    });
    assert.strictEqual(invalid.valid, false);
    assert.ok(invalid.errors.includes('Plugin missing "name" property.'));

    // Warning (Bad Naming)
    const warning = validatePlugin({
        name: 'BadPluginName',
        stability: 'experimental'
    });
    assert.strictEqual(warning.valid, true);
    assert.ok(warning.warnings.some(w => w.includes('should be kebab-case')));

    console.log('✅ Governance validation logic correct');
}

async function testPluginRegistrationRejection() {
    console.log('\n[Test 2] Registration Rejection');
    const manager = new PluginManager();
    const originalError = console.error;
    let errors: string[] = [];
    console.error = (msg: string) => errors.push(msg);

    // Should be rejected
    manager.register({} as any);

    console.error = originalError; // Restore

    assert.strictEqual(manager.plugins.length, 0); // Should not be added

    // log.error calls console.error, so we should see it. 
    // However, exact message match relies on logger implementation details.
    // relying on plugin length is sufficient proof of rejection.
    console.log('✅ Invalid plugins are rejected from manager');
}

async function testStabilityWarning() {
    console.log('\n[Test 3] Deprecation Warning');
    const manager = new PluginManager();

    // NOTE: Urja's logger uses console.log for warnings (yellow text), not console.warn!
    const originalLog = console.log;
    let logs: string[] = [];
    console.log = (msg: string) => {
        logs.push(msg);
        // We can pass through if we want to see output
        // originalLog(msg); 
    };

    manager.register({
        name: 'urja-plugin-old',
        stability: 'deprecated',
        transform: async (c) => c
    });

    console.log = originalLog; // Restore

    assert.strictEqual(manager.plugins.length, 1); // Added but warned

    // Check if any log contained the warning text
    const hasWarning = logs.some(l => l.includes('deprecated') || l.includes('Deprecated'));

    if (!hasWarning) {
        console.warn('Captured logs:', logs);
    }

    assert.ok(hasWarning, 'Expected deprecation warning in logs');

    console.log('✅ Deprecated plugins trigger warnings');
}

async function runGovernanceTests() {
    console.log('='.repeat(60));
    console.log('Phase 2.3: Plugin Governance & Stability');
    console.log('='.repeat(60));

    await testPluginValidation();
    await testPluginRegistrationRejection();
    await testStabilityWarning();

    console.log('\n' + '='.repeat(60));
    console.log('✅ GOVERNANCE SYSTEM VERIFIED');
}

runGovernanceTests().catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
});
