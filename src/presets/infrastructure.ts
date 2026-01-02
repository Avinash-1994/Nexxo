
import { UrjaPlugin } from '../core/plugins/types.js';
import { createRollupAdapter } from '../plugins/compat/rollup.js';
import { createJsTransformPlugin } from '../plugins/js-transform.js';
import { createPostCssPlugin } from '../plugins/css/postcss.js';
import { createLinkerPlugin } from '../plugins/core/linker.js';
// We'll assume these are standard internal plugins or adapters for common ecosystem tools
// For this baseline, we'll collect the core logic we've built.

import { createAssetPlugin } from '../plugins/assets.js';

export function getInfrastructurePreset(rootDir: string, outDir?: string): UrjaPlugin[] {
    const plugins: UrjaPlugin[] = [];

    // 1. Assets (Run early to handle imports)
    plugins.push(createAssetPlugin(outDir));

    // 2. JS/TS Transformation & Env handling (Honest Implementation via UniversalTransformer)
    plugins.push(createJsTransformPlugin(rootDir));

    // 3. CSS Handling (PostCSS / Tailwind Support)
    plugins.push(createPostCssPlugin(rootDir));

    // 4. Linker (Final specifier rewriting)
    plugins.push(createLinkerPlugin());

    return plugins;
}
