/**
 * @nexxo/plugin-wasm-sandbox
 * WASM plugin sandbox
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createWasmSandboxPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-wasm-sandbox',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Security check: WASM plugin sandbox
            await this.securityScan(code, id);
            return { code };
        },

        async securityScan(code: string, id: string): Promise<void> {
            // Scan for security issues
            const issues = [];
            
            // Check for common vulnerabilities
            if (code.includes('eval(')) {
                issues.push({ type: 'eval-usage', file: id });
            }
            if (code.includes('dangerouslySetInnerHTML')) {
                issues.push({ type: 'xss-risk', file: id });
            }
            
            if (issues.length > 0) {
                console.warn(`[@nexxo/plugin-wasm-sandbox] Security issues found:`, issues);
            }
        }
    };
}

export default createWasmSandboxPlugin;
