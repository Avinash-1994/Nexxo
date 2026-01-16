/**
 * @nexxo/plugin-vue-i18n
 * Vue i18n integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createVueI18nPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-vue-i18n',
        originalPlugin: 'vite-plugin-vue-i18n',
        
        async transform(code: string, id: string) {
            // Utility: Vue i18n integration
            return { code };
        }
    };
}

export default createVueI18nPlugin;
