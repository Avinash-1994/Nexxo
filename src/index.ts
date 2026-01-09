/**
 * Nexxo Build Tool - Public API
 * 
 * This is the ONLY stable public surface for Nexxo.
 * Everything not exported here is considered internal and may change without notice.
 * 
 * @public
 * @stable
 */

// ============================================================================
// CORE BUILD API
// ============================================================================

export { CoreBuildEngine } from './core/engine/index.js';
export type { BuildFingerprint, BuildArtifact, BuildMode } from './core/engine/types.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

export { loadConfig, defineConfig } from './config/index.js';
export type { BuildConfig } from './config/index.js';

// ============================================================================
// PLUGIN SYSTEM (Public Extension Surface #1)
// ============================================================================

export type {
    NexxoPlugin,
    PluginHookName,
    PluginManifest,
    PluginType
} from './core/plugins/types.js';

export { PluginManager } from './core/plugins/manager.js';

// Plugin Factories (Official Plugins Only)
export { createJsTransformPlugin } from './plugins/js-transform.js';
export { createAssetPlugin } from './plugins/assets.js';
export { createPostCssPlugin } from './plugins/css/postcss.js';
export { createFederationPlugin } from './plugins/federation_next.js';
export type { FederationConfig } from './plugins/federation_next.js';

// ============================================================================
// FRAMEWORK PRESETS (Public Extension Surface #2)
// ============================================================================

export type { Framework } from './core/framework-detector.js';
export type { FrameworkPreset } from './presets/frameworks.js';
export { getFrameworkPreset, frameworkPresets } from './presets/frameworks.js';

// ============================================================================
// INSPECTOR API (Public Extension Surface #3)
// ============================================================================

export { DependencyGraph } from './resolve/graph.js';
export type { GraphNode, GraphEdge } from './resolve/graph.js';

// ============================================================================
// UTILITIES (Stable Helpers)
// ============================================================================

export { log } from './utils/logger.js';

// ============================================================================
// INTERNAL APIs - DO NOT USE
// ============================================================================

/**
 * @internal
 * The following are NOT part of the public API and may change at any time:
 * 
 * - src/core/engine/config.ts (initBuild, attachGraph, etc.)
 * - src/core/engine/plan.ts (planBuild, planParallelExecution)
 * - src/core/engine/execute.ts (executeParallel)
 * - src/core/engine/optimize.ts (optimizeArtifacts)
 * - src/core/engine/emit.ts (emit)
 * - src/core/engine/hash.ts (canonicalHash)
 * - src/resolve/* (except DependencyGraph)
 * - src/build/* (legacy bundler)
 * - src/dev/* (dev server internals)
 * - src/ai/* (experimental features)
 * - src/meta-frameworks/* (experimental)
 * 
 * Using these will break your code in future versions.
 */
