import { Plugin } from './index.js';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { log } from '../utils/logger.js';

export interface FederationConfig {
    name: string;
    filename?: string;
    exposes?: Record<string, string>;
    remotes?: Record<string, string>;
    shared?: Record<string, { singleton?: boolean; requiredVersion?: string }>;
    prefetch?: string[];
    fallback?: string;
    mock?: boolean;
    healthCheck?: string;
}

export class FederationPlugin implements Plugin {
    name = 'federation-plugin';
    private config: FederationConfig;
    private root: string;

    constructor(config: FederationConfig, root: string) {
        this.config = config;
        this.root = root;
    }

    setup(build: any) {
        const outDir = build.initialOptions.outdir || 'dist';
        const filename = this.config.filename || 'remoteEntry.json';

        build.onEnd(async (result: any) => {
            if (result.errors.length > 0) return;

            log.info('Generating Federation Manifest...', { category: 'build' });

            const manifest: any = {
                name: this.config.name,
                exposes: {},
                remotes: this.config.remotes || {},
                shared: {},
                health: this.config.healthCheck,
                prefetch: this.config.prefetch,
                fallback: this.config.fallback,
                timestamp: Date.now()
            };

            // Process Exposes
            if (this.config.exposes) {
                for (const [key, importPath] of Object.entries(this.config.exposes)) {
                    // In a real implementation, we would map this to the actual output chunk
                    // For now, we'll assume the bundler has created a chunk or we point to source
                    // Ideally, we need to know the output filename for this module.
                    // Since esbuild metafile is available, we can look it up.

                    // Simplified: Point to the output file assuming standard naming or just pass the import path
                    // The runtime loader will need to handle this.
                    // For Native Federation, we usually want to point to a JS file.

                    // Let's assume the user configured manualChunks or we rely on the runtime to resolve.
                    // For this prototype, we'll just store the path.
                    manifest.exposes[key] = {
                        import: importPath, // This needs to be the output URL in production
                        name: key
                    };
                }
            }

            // Process Shared
            if (this.config.shared) {
                for (const [pkgName, options] of Object.entries(this.config.shared)) {
                    // Read package.json to get version
                    let version = '0.0.0';
                    try {
                        const pkgPath = path.resolve(this.root, 'node_modules', pkgName, 'package.json');
                        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
                        version = pkg.version;
                    } catch (e) {
                        log.warn(`Could not detect version for shared package: ${pkgName}`, { category: 'build' });
                    }

                    manifest.shared[pkgName] = {
                        version,
                        singleton: options.singleton,
                        requiredVersion: options.requiredVersion
                    };
                }
            }

            // Generate Hash
            const content = JSON.stringify(manifest);
            manifest.manifestHash = crypto.createHash('sha256').update(content).digest('hex');

            // Write Manifest
            const outputPath = path.join(outDir, filename);
            await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));

            log.success(`Federation manifest generated: ${filename}`, { category: 'build' });
        });
    }
}
