/**
 * @urja/rollup-compat - Plugin Compatibility Layer
 * 
 * This module provides adapters to use Rollup/Vite plugins within Urja.
 */

export { rollupAdapter } from './rollup.js';
export {
    urjaBabel,
    urjaTerser,
    urjaJson,
    urjaYaml,
    urjaMdx,
    urjaSvgr,
    TierA
} from './tier-a.js';

export { webpackLoaderAdapter } from './webpack.js';
export * from './tier-b.js'; // urjaCopy, urjaHtml
export * from './tier-c.js'; // urjaReact, urjaVue, urjaSvelte
export * from './deferred.js'; // urjaCompress, urjaCssExtract
