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
