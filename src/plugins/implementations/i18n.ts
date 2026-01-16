/**
 * @nexxo/plugin-i18n
 * Internationalization
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createI18nPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-i18n',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // Utility: Internationalization
            return { code };
        }
    };
}

export default createI18nPlugin;
