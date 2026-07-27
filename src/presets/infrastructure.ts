
import { LunxPlugin } from '../core/plugins/types.js';
import { rollupAdapter } from '../plugins/compat/rollup.js';
import { createJsTransformPlugin } from '../plugins/js-transform.js';
import { createPostCssPlugin } from '../plugins/css/postcss.js';
import { createLinkerPlugin } from '../plugins/core/linker.js';
// We'll assume these are standard internal plugins or adapters for common ecosystem tools
// For this baseline, we'll collect the core logic we've built.

import { createAssetPlugin } from '../plugins/assets.js';
import { createJsonPlugin } from '../plugins/json.js';
import { createHtmlPlugin } from '../plugins/html.js';
import { createFederationPlugin } from '../plugins/federation_next.js';
import { createStaticPlugin } from '../plugins/static.js';

export function getInfrastructurePreset(rootDir: string, outDir?: string, config?: any): LunxPlugin[] {
    const plugins: LunxPlugin[] = [];
    const effectiveOutDir = outDir || 'dist';

    // 0. JSON (Load early)
    plugins.push(createJsonPlugin());

    // 1. Assets (Run early to handle imports)
    plugins.push(createAssetPlugin(outDir));

    // 2. JS/TS Transformation & Env handling (Honest Implementation via UniversalTransformer)
    plugins.push(createJsTransformPlugin(rootDir));

    // 3. CSS Handling (PostCSS / Tailwind Support)
    plugins.push(createPostCssPlugin(rootDir));

    // 4. Linker (Final specifier rewriting)
    plugins.push(createLinkerPlugin());

    // 5. HTML Entry Generation
    plugins.push(createHtmlPlugin(rootDir, effectiveOutDir));

    // 6. Federation (Micro-frontends)
    if (config?.federation) {
        plugins.push(createFederationPlugin(config.federation));
    }

    // 7. Static Assets (public folder)
    plugins.push(createStaticPlugin(rootDir, effectiveOutDir));

    return plugins;
}
