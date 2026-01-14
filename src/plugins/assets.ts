import path from 'path';
import fs from 'fs/promises';
import { NexxoPlugin } from '../core/plugins/types.js';
import { fastHash } from '../native/index.js';

export function createAssetPlugin(outDir: string = 'build_output'): NexxoPlugin {
    return {
        manifest: {
            name: 'nexxo:asset',
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['resolveId', 'load'],
            permissions: { fs: 'read' }
        },
        id: 'nexxo:asset',
        async runHook(hook, input, context) {
            const ASSET_REGEX = /\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|otf)$/;

            if (hook === 'resolveId') {
                if (ASSET_REGEX.test(input.path)) {
                    return {
                        id: path.resolve(input.resolveDir, input.path),
                        external: false,
                        namespace: 'asset-ns'
                    };
                }
            }

            if (hook === 'load') {
                if (input.namespace === 'asset-ns' || ASSET_REGEX.test(input.path)) {
                    const content = await fs.readFile(input.path);

                    // Use fastHash from native module to calculate hash
                    const hash = fastHash(content.toString('utf-8'));

                    const ext = path.extname(input.path);
                    const name = path.basename(input.path, ext);
                    const hashedName = `${name}.${hash.slice(0, 8)}${ext}`;

                    // Create assets directory in output
                    const assetsDir = path.join(outDir, 'assets');
                    await fs.mkdir(assetsDir, { recursive: true });

                    // Write the asset file
                    const outputPath = path.join(assetsDir, hashedName);
                    await fs.writeFile(outputPath, content);

                    // Return the public path as a JS module
                    return {
                        code: `export default "/assets/${hashedName}";`,
                        loader: 'js'
                    };
                }
            }

            return null; // Return null to let other plugins handle it
        }
    };
}

