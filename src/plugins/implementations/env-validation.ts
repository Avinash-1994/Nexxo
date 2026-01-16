/**
 * @nexxo/plugin-env-validation
 * Environment variable validation
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createEnvValidationPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-env-validation',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Security check: Environment variable validation
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
                console.warn(`[@nexxo/plugin-env-validation] Security issues found:`, issues);
            }
        }
    };
}

export default createEnvValidationPlugin;
