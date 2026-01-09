
import { NexxoPlugin } from '../core/plugins/types.js';
import { UniversalTransformer } from '../core/universal-transformer.js';
import { detectFramework } from '../core/framework-detector.js';

export function createJsTransformPlugin(rootDir: string): NexxoPlugin {
    const transformer = new UniversalTransformer(rootDir);

    return {
        manifest: {
            name: 'nexxo:js-transform',
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['transformModule'],
            permissions: { fs: 'read' }
        },
        id: 'nexxo:js-transform',
        async runHook(hook, input) {
            if (hook === 'transformModule') {
                const framework = await detectFramework(rootDir);
                const defines: Record<string, string> = {};
                for (const [key, value] of Object.entries(process.env)) {
                    if (key.startsWith('NEXXO_') || key.startsWith('VITE_') || key === 'NODE_ENV') {
                        defines[`process.env.${key}`] = JSON.stringify(value);
                    }
                }

                const result = await transformer.transform({
                    code: input.code,
                    filePath: input.path,
                    framework,
                    root: rootDir,
                    isDev: input.mode !== 'production', // Use mode if available
                    define: defines,
                    target: input.target,
                    format: input.format
                });

                return {
                    ...input,
                    code: result.code,
                    map: result.map
                };
            }
            return input;
        }
    };
}
