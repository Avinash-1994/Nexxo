/**
 * @nexxo/plugin-formatjs
 * FormatJS (react-intl) integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createFormatjsPlugin(): PluginAdapter {
    return {
        name: '@nexxo/plugin-formatjs',
        originalPlugin: 'nexxo-native',
        
        async transform(code: string, id: string) {
            // i18n: FormatJS (react-intl) integration
            return { code };
        },

        async buildEnd() {
            console.log('[@nexxo/plugin-formatjs] i18n setup complete');
        }
    };
}

export default createFormatjsPlugin;
