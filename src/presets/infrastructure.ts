
import { UrjaPlugin } from '../core/plugins/types.js';
import { createRollupAdapter } from '../plugins/compat/rollup.js';
import { createJsTransformPlugin } from '../plugins/js-transform.js';
import { createPostCssPlugin } from '../plugins/css/postcss.js';
import { createLinkerPlugin } from '../plugins/core/linker.js';
// We'll assume these are standard internal plugins or adapters for common ecosystem tools
// For this baseline, we'll collect the core logic we've built.

export function getInfrastructurePreset(rootDir: string): UrjaPlugin[] {
    const plugins: UrjaPlugin[] = [];

    // 1. JS/TS Transformation & Env handling (Honest Implementation via UniversalTransformer)
    plugins.push(createJsTransformPlugin(rootDir));

    // 2. CSS Handling (PostCSS / Tailwind Support)
    plugins.push(createPostCssPlugin(rootDir));

    // 3. Linker (Final specifier rewriting)
    plugins.push(createLinkerPlugin());

    return plugins;
}
