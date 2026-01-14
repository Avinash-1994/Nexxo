
/**
 * Engine Configuration and Initialization
 * 
 * @internal - This is part of the core engine and NOT a public API.
 */

import { BuildConfig } from '../../config/index.js';
import { BuildContext, ResolvedConfig, BuildMode, EngineInfo, InputFingerprint } from './types.js';
import { InMemoryBuildCache, PersistentBuildCache } from './cache.js';
import { DependencyGraph } from '../../resolve/graph.js';
import { explainReporter } from './events.js';
import { canonicalHash } from './hash.js';
import fs from 'fs/promises';
import path from 'path';

import { PluginManager } from '../plugins/manager.js';
import { getInfrastructurePreset } from '../../presets/infrastructure.js';

// Stage 1: Initialization
export async function initBuild(
    userConfig: BuildConfig,
    mode: BuildMode,
    rootDir: string
): Promise<BuildContext> {
    explainReporter.report('init', 'initialize', 'Starting build initialization');

    const engine: EngineInfo = {
        name: "Nexxo",
        version: "0.1.3", // Should normally come from package.json
        buildTime: new Date().toISOString()
    };

    const config: ResolvedConfig = resolveConfig(userConfig, rootDir, mode);
    const cache = new PersistentBuildCache(rootDir);
    const pluginManager = new PluginManager();

    // 1. Register Infrastructure (Phase B2)
    const infraPlugins = getInfrastructurePreset(rootDir, config.outputDir);
    for (const p of infraPlugins) {
        await pluginManager.register(p);
    }

    // 2. Register User Plugins (Phase F2)
    if (userConfig.plugins) {
        for (const p of userConfig.plugins) {
            await pluginManager.register(p);
        }
    }

    explainReporter.report('init', 'config_resolved', 'Config frozen', { config });

    return {
        engine,
        mode,
        rootDir,
        env: process.env as Record<string, string>,
        target: userConfig.platform || 'browser',
        graph: new DependencyGraph(), // Empty initially
        graphHash: '', // Placeholder
        cache,
        config,
        pluginManager
    };
}

function resolveConfig(userConfig: BuildConfig, rootDir: string, mode: BuildMode): ResolvedConfig {
    const sourcemap = userConfig.build?.sourcemap;
    return {
        entryPoints: userConfig.entry,
        outputDir: path.isAbsolute(userConfig.outDir || 'dist')
            ? userConfig.outDir
            : path.resolve(rootDir, userConfig.outDir || 'dist'),
        publicPath: '/',
        splittingStrategy: userConfig.build?.splitting ? 'module' : 'route',
        hashing: 'content',
        sourceMaps: sourcemap === 'none' ? false : (sourcemap === undefined ? 'external' : sourcemap),
        minify: userConfig.build?.minify ?? (mode === 'production' || mode === 'build'),
    };
}

// Stage 2: Input Fingerprinting
export async function computeInputFingerprint(ctx: BuildContext): Promise<InputFingerprint> {
    explainReporter.report('fingerprint', 'start', 'Computing input fingerprint');

    // 1. Hash Config
    // Normalize absolute paths to ensure deterministic hash across environments (CI vs Local)
    const normalizedConfig = {
        ...ctx.config,
        outputDir: path.relative(ctx.rootDir, ctx.config.outputDir)
    };
    const configHash = canonicalHash(normalizedConfig);

    // 2. Hash Engine
    // We strictly use version/name, NOT buildTime for semantic hash
    const engineFingerprint = canonicalHash({ name: ctx.engine.name, version: ctx.engine.version });

    // 3. Hash Source Files (Entry points initially, full graph later? 
    // SPEC SAYS: "Hash all source files". 
    // However, we haven't built the graph yet in the main flow? 
    // Actually Stage 2 is "Input Fingerprinting", Stage 3 is "Attach Graph".
    // Usually we need the graph to know *which* files are source files.
    // If the spec implies we fingerprint the *entry* concept or the *entire repo*, 
    // let's assume for now we fingerprint the Configuration + Environment + Entry file paths.
    // Real source content hashing usually happens *during* graph build or *after* graph build.
    // BUT the spec says Stage 2 -> Stage 3. This implies we might scan the directory or just fingerprint known inputs.
    // Let's fingerprint the config and entry points for now. The graph content hash comes later.

    // Correction: In a pure build system, "Inputs" are files. If we don't have the graph, we don't know the inputs.
    // Maybe "InputFingerprint" at this stage is just "Configuration & Environment"?
    // Or maybe we treat *all* files in src as inputs? 
    // Let's stick to Config + Entry Paths for the 'Input' definition at this precise millisecond.
    // We will update it if we move this stage after graph. 
    // Wait, the spec says: "Hash all source files" inside `computeInputFingerprint`.
    // Valid implementation: We might need to walk the tree *now* or defer this until after graph?
    // Spec Order: Init -> Fingerprint -> Attach Graph.
    // This implies we fingerprint based on *what we know*. 
    // Let's fingerprint the Entry Files themselves if they exist.

    // 3. Hash Source Files
    // To guarantee inputHash catches ALL changes, we must scan the directory.
    const sourceFiles: { path: string, contentHash: string }[] = [];

    const excludes = new Set(['node_modules', '.git', 'dist', 'coverage', '.DS_Store']);
    if (ctx.config.outputDir) {
        excludes.add(path.basename(ctx.config.outputDir));
    }

    async function scan(dir: string) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const dirent of entries) {
                if (excludes.has(dirent.name)) continue;

                const fullPath = path.join(dir, dirent.name);
                if (dirent.isDirectory()) {
                    await scan(fullPath);
                } else if (dirent.isFile()) {
                    // Match source files
                    if (/\.(ts|tsx|js|jsx|json|css|html|astro|vue|svelte|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf)$/i.test(dirent.name)) {
                        try {
                            const content = await fs.readFile(fullPath);
                            const relPath = path.relative(ctx.rootDir, fullPath);
                            sourceFiles.push({
                                path: relPath, // relative path for stability
                                contentHash: canonicalHash(content)
                            });
                        } catch (e) { }
                    }
                }
            }
        } catch (e) {
            // Directory might not exist or be readable
        }
    }

    await scan(ctx.rootDir);

    sourceFiles.sort((a, b) => a.path.localeCompare(b.path));

    const inputsToHash = {
        config: configHash,
        engine: engineFingerprint,
        sources: sourceFiles
    };

    const inputHash = canonicalHash(inputsToHash);

    explainReporter.report('fingerprint', 'computed', 'Input fingerprint ready', { inputHash });

    return {
        sourceFiles,
        configHash,
        engineFingerprint,
        inputHash
    };
}

// Stage 3: Attach Graph
export function attachGraph(ctx: BuildContext, graph: DependencyGraph): BuildContext {
    explainReporter.report('graph', 'attached', 'Dependency graph attached');

    // Compute Graph Hash
    const nodesObj: Record<string, any> = {};
    for (const [key, val] of graph.nodes.entries()) {
        const deps = val.edges.map(e => e.to).sort();
        nodesObj[key] = {
            id: val.id,
            deps: deps
        };
    }
    const graphHash = canonicalHash(nodesObj);

    return {
        ...ctx,
        graph,
        graphHash
    };
}
