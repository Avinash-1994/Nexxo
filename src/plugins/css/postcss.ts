
import path from 'path';
import { createRequire } from 'module';
import { UrjaPlugin } from '../../core/plugins/types.js';
import { log } from '../../utils/logger.js';

export function createPostCssPlugin(rootDir: string): UrjaPlugin {
    let processor: any = null;
    let initialized = false;

    async function ensureInitialized(require: NodeRequire) {
        if (initialized) return;

        try {
            const postcss = require('postcss');
            const configPath = path.resolve(rootDir, 'postcss.config.js');

            let plugins = [];
            try {
                // Try to load user's postcss config
                // In ESM node, we can use dynamic import for .js or .mjs
                const pConfig = await import(`file://${configPath}?t=${Date.now()}`);
                const config = pConfig.default || pConfig;

                if (config.plugins) {
                    if (Array.isArray(config.plugins)) {
                        plugins = config.plugins.map((p: any) => typeof p === 'string' ? require(p) : p);
                    } else {
                        for (const [name, options] of Object.entries(config.plugins)) {
                            const pFactory = require(name);
                            plugins.push(pFactory(options));
                        }
                    }
                }
            } catch (e) {
                // Fallback to basic Tailwind if config not found but dependencies are there
                try {
                    plugins = [require('tailwindcss'), require('autoprefixer')];
                } catch (inner) {
                    // No postcss config and no tailwind
                    plugins = [];
                }
            }

            if (plugins.length > 0) {
                processor = postcss(plugins);
            }
        } catch (error: any) {
            log.warn(`PostCSS initialization failed: ${error.message}. CSS will be passed through raw.`);
        }

        initialized = true;
    }

    return {
        manifest: {
            name: 'urja:postcss',
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['transformModule'],
            permissions: { fs: 'read' }
        },
        id: 'urja:postcss',
        async runHook(hook, input) {
            if (hook !== 'transformModule' || !input.path.endsWith('.css')) {
                return input;
            }

            try {
                const require = createRequire(path.join(rootDir, 'package.json'));
                await ensureInitialized(require);

                if (processor) {
                    const result = await processor.process(input.code, {
                        from: input.path,
                        to: input.path,
                        map: false
                    });
                    return { ...input, code: result.css };
                }

                return input;

            } catch (error: any) {
                log.error(`PostCSS transform failed for ${input.path}: ${error.message}`);
                return input;
            }
        }
    };
}
