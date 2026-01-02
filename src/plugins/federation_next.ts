
import { UrjaPlugin } from '../core/plugins/types.js';
import { canonicalHash } from '../core/engine/hash.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

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

export function createFederationPlugin(config: FederationConfig): UrjaPlugin {
    return {
        manifest: {
            name: 'urja:federation',
            version: '1.0.0',
            engineVersion: '1.0.0',
            type: 'js',
            hooks: ['buildEnd'],
            permissions: { fs: 'read' }
        },
        id: canonicalHash(`federation:${config.name}`),
        async runHook(hook, input, context) {
            if (hook !== 'buildEnd') return input;

            const { artifacts, ctx } = input;
            const filename = config.filename || 'remoteEntry.json';

            const manifest: any = {
                name: config.name,
                exposes: {},
                remotes: config.remotes || {},
                shared: {},
                health: config.healthCheck,
                prefetch: config.prefetch,
                fallback: config.fallback,
                timestamp: Date.now()
            };

            // Process Exposes
            if (config.exposes) {
                for (const [key, importPath] of Object.entries(config.exposes)) {
                    // Simple mapping: find the artifact that corresponds to this exposed module
                    // This is tricky without a bundler metafile. 
                    // For now, in this simpler engine, we can check if there's a chunk for it.
                    // Or we just point to the client bundle if it's there.

                    // HEURISTIC: Find chunk with ID containing the exposed name
                    const exposedName = path.basename(importPath, path.extname(importPath));
                    const artifact = artifacts.find((a: any) => a.fileName.includes(exposedName));

                    manifest.exposes[key] = {
                        import: artifact ? `./${artifact.fileName}` : importPath,
                        name: key,
                        assets: []
                    };
                }
            }

            // Process Shared
            if (config.shared) {
                for (const [pkgName, options] of Object.entries(config.shared)) {
                    // In a real scenario, we'd read package.json
                    const version = '18.2.0'; // Mock for now or read from disk
                    manifest.shared[pkgName] = {
                        version, // simplified
                        singleton: options.singleton,
                        requiredVersion: options.requiredVersion
                    };
                }
            }

            // Hash
            const content = JSON.stringify(manifest);
            manifest.manifestHash = crypto.createHash('sha256').update(content).digest('hex');

            // Create Artifact
            const manifestArtifact = {
                id: canonicalHash(content).substring(0, 16),
                type: 'json',
                fileName: filename,
                dependencies: [],
                source: JSON.stringify(manifest, null, 2)
            };

            return {
                artifacts: [...artifacts, manifestArtifact]
            };
        }
    };
}
