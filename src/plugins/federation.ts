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

            // Process Exposes - Map to actual output files
            if (this.config.exposes && result.metafile) {
                const outputs = result.metafile.outputs as Record<string, {
                    entryPoint?: string;
                    inputs?: Record<string, any>;
                    bytes: number;
                }>;

                for (const [key, importPath] of Object.entries(this.config.exposes)) {
                    // Resolve the import path relative to root
                    const absolutePath = path.resolve(this.root, importPath);

                    // Find the output file that corresponds to this input
                    let outputFile = null;
                    let outputPath = null;

                    for (const [outPath, outInfo] of Object.entries(outputs)) {
                        // Check if this output was generated from our input
                        if (outInfo.entryPoint) {
                            const entryAbsolute = path.resolve(this.root, outInfo.entryPoint);
                            if (entryAbsolute === absolutePath) {
                                outputFile = path.basename(outPath);
                                outputPath = outPath.replace(outDir + '/', '');
                                break;
                            }
                        }

                        // Also check inputs (for bundled modules)
                        if (outInfo.inputs && outInfo.inputs[importPath]) {
                            outputFile = path.basename(outPath);
                            outputPath = outPath.replace(outDir + '/', '');
                            break;
                        }
                    }

                    if (!outputFile) {
                        log.warn(`Could not find output for exposed module: ${key} (${importPath})`, { category: 'build' });
                        // Fallback to source path
                        outputPath = importPath;
                    }

                    manifest.exposes[key] = {
                        import: `./${outputPath}`,
                        name: key,
                        assets: [] // Could include CSS/other assets
                    };
                }
            } else if (this.config.exposes) {
                // Fallback if no metafile
                for (const [key, importPath] of Object.entries(this.config.exposes)) {
                    manifest.exposes[key] = {
                        import: importPath,
                        name: key,
                        assets: []
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
