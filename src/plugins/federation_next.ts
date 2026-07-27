
import { LunxPlugin } from '../core/plugins/types.js';
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

export function createFederationPlugin(config: FederationConfig): LunxPlugin {
    return {
        manifest: {
            name: 'lunx:federation',
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

                    // HEURISTIC: Find chunk with ID containing the exposed name, or fallback to the main bundle
                    const exposedName = path.basename(importPath, path.extname(importPath));
                    const artifact = artifacts.find((a: any) => a.fileName.includes(exposedName)) 
                                  || artifacts.find((a: any) => a.type === 'js' && a.fileName.includes('index'));

                    let shortId = importPath; // fallback
                    let chunkUrl = artifact ? path.basename(artifact.fileName) : '';

                    if (artifact && artifact.modules) {
                        const mod = artifact.modules.find((m: any) => 
                            (m.path && m.path.includes(exposedName)) || 
                            m.id.includes(exposedName) || 
                            m.id.includes(importPath.replace('./', ''))
                        );
                        if (mod) {
                            shortId = mod.shortId || mod.id;
                        } else {
                            console.log('[Federation Plugin Debug] Module for exposed name missing! Available:', artifact.modules.map((m: any) => m.path || m.id));
                        }
                    }

                    manifest.exposes[key] = {
                        import: importPath,
                        name: key,
                        chunk: chunkUrl,
                        shortId: shortId
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
            const isJs = filename.endsWith('.js');
            let sourceCode = JSON.stringify(manifest, null, 2);

            if (isJs) {
                sourceCode = `
var ${config.name} = (() => {
  var exposes = ${JSON.stringify(manifest.exposes, null, 2)};
  var __promises = {};
  var __publicPath = document.currentScript ? document.currentScript.src : window.location.href;
  __publicPath = __publicPath.substring(0, __publicPath.lastIndexOf('/'));

  return {
    get: async (moduleName) => {
      return async () => {
        if (!exposes[moduleName]) throw new Error("Module not found: " + moduleName);
        var exposed = exposes[moduleName];
        
        // Ensure monolithic chunk is loaded
        if (exposed.chunk) {
          if (!__promises[exposed.chunk]) {
            __promises[exposed.chunk] = new Promise((resolve, reject) => {
              var script = document.createElement("script");
              script.src = __publicPath + "/assets/" + exposed.chunk;
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
          await __promises[exposed.chunk];
        }
        
        // Use Lunx's globalThis.r runtime short ID registration
        if (typeof globalThis.r === 'function') {
           return globalThis.r(exposed.shortId);
        }
        throw new Error("Lunx runtime missing in host!");
      };
    },
    init: async (shareScope) => {
      // Dynamic federation shared scopes
      return true;
    }
  };
})();`;
            }

            const manifestArtifact = {
                id: canonicalHash(content).substring(0, 16),
                type: isJs ? 'js' : 'json',
                fileName: filename,
                dependencies: [],
                source: sourceCode
            };

            return {
                artifacts: [...artifacts, manifestArtifact]
            };
        }
    };
}
