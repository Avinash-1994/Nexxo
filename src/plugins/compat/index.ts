/**
 * @nexxo/rollup-compat - Plugin Compatibility Layer
 * 
 * This module provides adapters to use Rollup/Vite plugins within Nexxo.
 */

export { rollupAdapter } from './rollup.js';
export {
    nexxoBabel,
    nexxoTerser,
    nexxoJson,
    nexxoYaml,
    nexxoMdx,
    nexxoSvgr,
    TierA
} from './tier-a.js';

export { webpackLoaderAdapter } from './webpack.js';
export * from './tier-b.js'; // nexxoCopy, nexxoHtml
export * from './tier-c.js'; // nexxoReact, nexxoVue, nexxoSvelte
export * from './deferred.js'; // nexxoCompress, nexxoCssExtract
