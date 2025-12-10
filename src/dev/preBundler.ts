import path from 'path';
import fs from 'fs/promises';
import { build } from 'esbuild';
import { createHash } from 'crypto';
import { createRequire } from 'module';
import { log } from '../utils/logger.js';

const require = createRequire(import.meta.url);

/**
 * Production-Ready Dependency Pre-Bundler
 * Uses full dependency graph bundling with splitting
 * Handles transitive dependencies automatically
 */
export class DependencyPreBundler {
    constructor(private root: string, private cacheDir: string = 'node_modules/.urja') { }

    /**
     * Pre-bundle dependencies using full graph approach
     * This bundles ALL dependencies together with their transitive deps
     * Uses esbuild's splitting to create shared chunks
     */
    async preBundleDependencies(deps: string[]): Promise<Map<string, string>> {
        const bundledDeps = new Map<string, string>();
        const cacheDir = path.join(this.root, this.cacheDir);

        // Ensure cache directory exists
        await fs.mkdir(cacheDir, { recursive: true });

        // Generate hash of package.json for cache invalidation
        const pkgJsonPath = path.join(this.root, 'package.json');
        const pkgJson = await fs.readFile(pkgJsonPath, 'utf-8');
        const hash = createHash('md5').update(pkgJson).digest('hex').slice(0, 8);
        const metaPath = path.join(cacheDir, '_metadata.json');

        // Check if cache is valid
        let cachedMeta: any = {};
        try {
            cachedMeta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
            if (cachedMeta.hash === hash && cachedMeta.deps?.length === deps.length) {
                log.info('Using cached pre-bundled dependencies');
                // Load from cache
                for (const dep of deps) {
                    const cachedPath = cachedMeta.depMap?.[dep];
                    if (cachedPath) {
                        bundledDeps.set(dep, cachedPath);
                    }
                }
                if (bundledDeps.size === deps.length) {
                    return bundledDeps;
                }
            }
        } catch {
            // No cache or invalid, proceed with bundling
        }

        log.info('Pre-bundling dependencies with full graph...', { count: deps.length });

        const root = this.root; // Capture root for usage in plugin

        try {
            // Resolve all entry points
            const entryPoints: Record<string, string> = {};
            for (const dep of deps) {
                let resolvedPath: string | undefined;

                // Priority: Try to find package.json and use 'module' field (ESM)
                try {
                    // Find package root
                    const pkgName = dep.startsWith('@') ? dep.split('/').slice(0, 2).join('/') : dep.split('/')[0];
                    // Clean handling of subpaths (e.g. react-dom/client) - we need the ROOT package for package.json
                    // But if dep IS a subpath, we might not want the root main/module. 
                    // Actually, modern generic resolving is hard.
                    // Let's stick to resolving the PACKAGE root first.

                    let pkgDir;
                    try {
                        const mainFile = require.resolve(pkgName + '/package.json', { paths: [root] });
                        pkgDir = path.dirname(mainFile);
                    } catch (e: any) {
                        // Fallback guessing
                        pkgDir = path.join(root, 'node_modules', pkgName);
                        // log.debug(`[PreBundler] JSON resolve failed for ${pkgName}: ${e.message}, using fallback: ${pkgDir}`);
                    }

                    if (pkgDir) {
                        const pkgJsonPath = path.join(pkgDir, 'package.json');
                        try {
                            const pkgJsonRaw = await fs.readFile(pkgJsonPath, 'utf-8');
                            const pkgJson = JSON.parse(pkgJsonRaw);

                            // log.debug(`[PreBundler] Checked ${pkgName} package.json. Module: ${pkgJson.module}`);

                            // Only use 'module' if we are importing the ROOT of the package
                            // If 'dep' is 'react-dom/client', we shouldn't use react-dom's 'module' entry
                            if (dep === pkgName && pkgJson.module) {
                                resolvedPath = path.join(pkgDir, pkgJson.module);
                                log.debug(`[PreBundler] Using ESM module for ${dep}: ${resolvedPath}`);
                            } else if (dep === pkgName && pkgJson.exports) {
                                // Basic export map handling for "."
                                if (typeof pkgJson.exports === 'object') {
                                    const dot = pkgJson.exports['.'];
                                    if (dot) {
                                        const importPath = typeof dot === 'string' ? dot :
                                            (dot.import || dot.default || dot.require);
                                        if (importPath) {
                                            resolvedPath = path.join(pkgDir, importPath);
                                        }
                                    }
                                }
                            }
                        } catch (e: any) {
                            log.warn(`[PreBundler] Failed to read/parse package.json for ${pkgName}: ${e.message}`);
                        }
                    }
                } catch (e: any) {
                    log.warn(`[PreBundler] ESM resolution error for ${dep}: ${e.message}`);
                }

                // Fallback to require.resolve (Standard Node Resolution - usually CJS)
                if (!resolvedPath) {
                    try {
                        resolvedPath = require.resolve(dep, { paths: [root] });
                    } catch (e) {
                        // Double fallback (candidates)
                        // ... existing code ...
                        try {
                            const maybeDirect = path.join(root, 'node_modules', dep);
                            try { await fs.access(maybeDirect); resolvedPath = maybeDirect; } catch { }
                        } catch { }
                    }
                }

                if (resolvedPath) {
                    // ... verify existence ...
                    const normalizedName = dep.replace(/[/@]/g, '_');
                    entryPoints[normalizedName] = resolvedPath;
                    log.info(`[PreBundler] Resolved ${dep} → ${resolvedPath}`);
                } else {
                    log.warn(`[PreBundler] Could not resolve ${dep}`);
                }
            }

            if (Object.keys(entryPoints).length === 0) {
                log.warn('[PreBundler] No dependencies to bundle');
                return bundledDeps;
            }

            // Production-ready: Full graph bundling WITH splitting + CJS export fix
            const result = await build({
                entryPoints,
                bundle: true,
                format: 'esm',
                platform: 'browser',
                target: 'es2020',
                outdir: cacheDir,
                splitting: true,  // PRODUCTION: Shared chunks for efficiency
                chunkNames: 'chunks/[name]-[hash]',
                entryNames: '[name]',
                minify: false,
                sourcemap: true,
                treeShaking: true,
                define: {
                    'process.env.NODE_ENV': '"development"',
                    'global': 'globalThis'
                },
                plugins: [
                    // Plugin to fix CJS → ESM named exports
                    {
                        name: 'cjs-esm-interop',
                        setup(build) {
                            // Post-process: Add named exports to entry point files
                            build.onEnd(async (result) => {
                                if (result.metafile) {
                                    for (const [outputPath, outputInfo] of Object.entries(result.metafile.outputs)) {
                                        // Only process entry points (not chunks)
                                        if (outputInfo.entryPoint) {
                                            const fullPath = path.resolve(outputPath);
                                            let content = await fs.readFile(fullPath, 'utf-8');

                                            // Check if it's a thin wrapper (only imports from chunks)
                                            if (content.includes('from "./chunks/') && !content.includes('export {')) {
                                                // Find which original package this is
                                                const basename = path.basename(outputPath, '.js');
                                                for (const dep of deps) {
                                                    const normalizedName = dep.replace(/[/@]/g, '_');
                                                    if (basename === normalizedName) {
                                                        try {
                                                            // Load the original CJS module to get exports
                                                            const pkgPath = require.resolve(dep, { paths: [root] });
                                                            const pkg = require(pkgPath);

                                                            // Get all named exports
                                                            const exportNames = Object.getOwnPropertyNames(pkg)
                                                                .filter(key =>
                                                                    /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) &&
                                                                    key !== 'default' &&
                                                                    key !== '__esModule'
                                                                );

                                                            // Add re-exports if needed
                                                            if (exportNames.length > 0 && !content.includes('export const')) {
                                                                const defaultExportMatch = content.match(/export default (\w+)(?:\(\))?;?/);
                                                                if (defaultExportMatch) {
                                                                    const varName = defaultExportMatch[1];
                                                                    const isFunctionCall = content.includes(`export default ${varName}()`);

                                                                    let exportBase = varName;

                                                                    if (isFunctionCall) {
                                                                        // Replace "export default foo();" with "const __pkg = foo(); export default __pkg;"
                                                                        content = content.replace(
                                                                            `export default ${varName}();`,
                                                                            `const __pkg = ${varName}();\nexport default __pkg;`
                                                                        );
                                                                        exportBase = '__pkg';
                                                                    }

                                                                    const namedExports = exportNames.map(name =>
                                                                        `export const ${name} = ${exportBase}.${name};`
                                                                    ).join('\n');

                                                                    content = content.replace(
                                                                        /\/\/# sourceMappingURL=/,
                                                                        `${namedExports}\n//# sourceMappingURL=`
                                                                    );

                                                                    await fs.writeFile(fullPath, content);
                                                                    log.info(`[PreBundler] Added ${exportNames.length} named exports to ${dep}`);
                                                                }
                                                            }
                                                        } catch (e: any) {
                                                            log.warn(`[PreBundler] Could not add exports for ${dep}: ${e.message}`);
                                                        }
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                ],
                logLevel: 'warning',
                metafile: true,
            });

            // Build dependency map from output files
            const depMap: Record<string, string> = {};

            if (result.metafile) {
                const outputs = result.metafile.outputs;

                // Map entry points to their output files
                for (const [outputPath, outputInfo] of Object.entries(outputs)) {
                    if (outputInfo.entryPoint) {
                        // Match output file to original dependency by exact normalized name
                        const outputBasename = path.basename(outputPath, '.js');

                        for (const dep of deps) {
                            const normalizedName = dep.replace(/[/@]/g, '_');
                            // Exact match - prevent "react" matching "react-router-dom"
                            if (outputBasename === normalizedName) {
                                const relativePath = path.relative(cacheDir, outputPath);
                                const urlPath = `/@urja-deps/${relativePath}`;
                                bundledDeps.set(dep, urlPath);
                                depMap[dep] = urlPath;
                                log.info(`✓ Pre-bundled: ${dep} → ${urlPath}`);
                                break;
                            }
                        }
                    }
                }
            }

            // Save metadata
            await fs.writeFile(metaPath, JSON.stringify({
                hash,
                deps: Array.from(bundledDeps.keys()),
                depMap,
                timestamp: Date.now()
            }, null, 2));

            log.info('Dependencies pre-bundled successfully', { count: bundledDeps.size });
            return bundledDeps;

        } catch (error: any) {
            log.error('Pre-bundling failed:', error.message);
            log.error(error.stack);
            return bundledDeps;
        }
    }

    async scanDependencies(entryFile: string): Promise<string[]> {
        const content = await fs.readFile(entryFile, 'utf-8');
        const deps = new Set<string>();

        // Simple regex-based scan for imports
        const importRegex = /from\s+['"]([^.\/][^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const dep = match[1];
            // Extract package name (handle scoped packages)
            const pkgName = dep.startsWith('@')
                ? dep.split('/').slice(0, 2).join('/')
                : dep.split('/')[0];
            deps.add(pkgName);
        }

        return Array.from(deps);
    }
}
