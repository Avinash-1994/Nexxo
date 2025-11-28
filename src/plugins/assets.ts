import path from 'path';
import fs from 'fs/promises';
import { Plugin } from './index.js';
import { RustNativeWorker } from '../native/index.js';

export class AssetPlugin implements Plugin {
    name = 'asset-plugin';
    private worker: RustNativeWorker;
    private outDir: string;

    constructor(outDir: string = 'build_output') {
        this.worker = new RustNativeWorker(4);
        this.outDir = outDir;
    }

    setup(build: any) {
        build.onResolve({ filter: /\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|otf)$/ }, (args: any) => {
            return {
                path: path.resolve(args.resolveDir, args.path),
                namespace: 'asset-ns'
            };
        });

        build.onLoad({ filter: /.*/, namespace: 'asset-ns' }, async (args: any) => {
            const content = await fs.readFile(args.path);

            // Use Native Worker to calculate hash
            const hash = this.worker.processAsset(content);

            const ext = path.extname(args.path);
            const name = path.basename(args.path, ext);
            const hashedName = `${name}.${hash.slice(0, 8)}${ext}`;

            // Create assets directory in output
            const assetsDir = path.join(this.outDir, 'assets');
            await fs.mkdir(assetsDir, { recursive: true });

            // Write the asset file
            const outputPath = path.join(assetsDir, hashedName);
            await fs.writeFile(outputPath, content);

            // Return the public path as a JS module
            return {
                contents: `export default "/assets/${hashedName}";`,
                loader: 'js'
            };
        });
    }
}
