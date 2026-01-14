
/**
 * Module 3: Elite DX - LSP Logic Test
 * Validates Day 18 Language Server Protocol Logic
 */

import { NexxoLSPServer } from './mocks/lsp_server.js';

async function runLSPTest() {
    console.log('🧪 Testing Nexxo LSP Logic...');

    const server = new NexxoLSPServer();

    // Test 1: Completions
    console.log('  Test 1: Auto-Completions...');
    const docText = `
export default {
    mode: 'development',
    plugins: [
    ]
}`;
    // Position inside plugins: [
    const compl = server.onCompletion(docText, { line: 3, character: 10 });

    const hasReact = compl.some(c => c.label === '@nexxo/plugin-react');
    const hasVue = compl.some(c => c.label === '@nexxo/plugin-vue');

    if (!hasReact || !hasVue) {
        throw new Error('Failed to suggest plugins');
    }
    console.log('  ✅ Smart Plugin Suggestions Verified');


    // Test 2: Mode Completion
    console.log('  Test 2: Mode Suggestions...');
    const complMode = server.onCompletion("    mode:", { line: 0, character: 10 });
    if (!complMode.some(c => c.label === "'development'")) {
        throw new Error('Failed to suggest mode');
    }
    console.log('  ✅ Mode Suggestions Verified');


    // Test 3: Diagnostics (Validators)
    console.log('  Test 3: Live Diagnostics...');
    const badDoc = `
export default {
    mode: 'prod',
    plugins: []
}
import * as _ from 'lodash';
`;
    const diags = server.validate(badDoc);

    // Check for 'prod' warning
    const warnMode = diags.find(d => d.message.includes("Did you mean 'production'?"));
    if (!warnMode) throw new Error("Failed to detect 'prod' typo");
    console.log('  ✅ Config Validation Verified');

    // Check for 'lodash' info
    const infoPerf = diags.find(d => d.message.includes("tree-shaking")); // "better tree-shaking"
    if (!infoPerf) throw new Error("Failed to detect perf hint");
    console.log('  ✅ Performance Hints Verified');

    console.log('---------------------------');
    console.log('🎉 Day 18 LSP Logic Verified!');
}

runLSPTest().catch(e => {
    console.error('❌ LSP Test Failed:', e);
    process.exit(1);
});
