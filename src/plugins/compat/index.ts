/**
 * @lunx/rollup-compat - Plugin Compatibility Layer
 * 
 * This module provides adapters to use Rollup/Vite plugins within Lunx.
 */

export { rollupAdapter, rollupAdapter as vitePluginAdapter, rollupAdapter as viteToLunx, rollupAdapter as createRollupAdapter } from './rollup.js';
export {
    lunxBabel,
    lunxTerser,
    lunxJson,
    lunxYaml,
    lunxMdx,
    lunxSvgr,
    TierA
} from './tier-a.js';

export { webpackLoaderAdapter } from './webpack.js';
export * from './tier-b.js'; // lunxCopy, lunxHtml
export * from './tier-c.js'; // lunxReact, lunxVue, lunxSvelte
export * from './deferred.js'; // lunxCompress, lunxCssExtract
