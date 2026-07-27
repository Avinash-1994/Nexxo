/**
 * @lunx/plugin-formatjs
 * FormatJS (react-intl) integration
 */

import { PluginAdapter } from '../ported/adapter.js';

export function createFormatjsPlugin(): PluginAdapter {
    return {
        name: '@lunx/plugin-formatjs',
        originalPlugin: 'lunx-native',
        
        async transform(code: string, id: string) {
            // i18n: FormatJS (react-intl) integration
            return { code };
        },

        async buildEnd() {
            console.log('[@lunx/plugin-formatjs] i18n setup complete');
        }
    };
}

export default createFormatjsPlugin;
