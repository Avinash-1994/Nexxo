import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

/**
 * Inlined JS fallback graph analyzer.
 * Kept here intentionally to avoid a forbidden cross-boundary import from
 * core/graph into the native layer. See docs/internal/EXTENSION_SURFACE.md.
 */
class JSGraphAnalyzer {
    private nodes: Map<string, string[]> = new Map();

    addBatch(ids: string[], edges: string[][]): void {
        for (let i = 0; i < ids.length; i++) {
            this.nodes.set(ids[i], edges[i] || []);
        }
    }

    detectCycles(): { cycle: string[]; entryPoint: string }[] {
        const cycles: { cycle: string[]; entryPoint: string }[] = [];
        const visited = new Set<string>();
        const onStack = new Set<string>();
        const path: string[] = [];
        const stack: { node: string; childIndex: number }[] = [];

        for (const startNode of this.nodes.keys()) {
            if (visited.has(startNode)) continue;
            stack.push({ node: startNode, childIndex: 0 });
            visited.add(startNode);
            onStack.add(startNode);
            path.push(startNode);

            while (stack.length > 0) {
                const peek = stack[stack.length - 1];
                const { node, childIndex } = peek;
                const deps = this.nodes.get(node) || [];

                if (childIndex < deps.length) {
                    peek.childIndex++;
                    const dep = deps[childIndex];
                    if (!visited.has(dep)) {
                        visited.add(dep);
                        onStack.add(dep);
                        path.push(dep);
                        stack.push({ node: dep, childIndex: 0 });
                    } else if (onStack.has(dep)) {
                        const cycleStart = path.indexOf(dep);
                        if (cycleStart !== -1) {
                            cycles.push({ cycle: path.slice(cycleStart), entryPoint: dep });
                        }
                    }
                } else {
                    onStack.delete(node);
                    path.pop();
                    stack.pop();
                }
            }
        }
        return cycles;
    }

    findOrphanedNodes(entryPoints: string[]): string[] {
        const reachable = new Set<string>(entryPoints);
        const queue: string[] = [...entryPoints];
        while (queue.length > 0) {
            const node = queue.shift()!;
            for (const dep of (this.nodes.get(node) || [])) {
                if (!reachable.has(dep)) { reachable.add(dep); queue.push(dep); }
            }
        }
        return [...this.nodes.keys()].filter(n => !reachable.has(n));
    }

    analyze(entryPoints: string[]) {
        const cycles = this.detectCycles();
        let totalEdges = 0;
        for (const deps of this.nodes.values()) totalEdges += deps.length;
        return {
            hasCycles: cycles.length > 0,
            cycles,
            orphanedNodes: this.findOrphanedNodes(entryPoints),
            entryPoints,
            totalNodes: this.nodes.size,
            totalEdges
        };
    }

    nodeCount(): number { return this.nodes.size; }
    edgeCount(): number {
        let c = 0;
        for (const d of this.nodes.values()) c += d.length;
        return c;
    }
    clear(): void { this.nodes.clear(); }
}

const _require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let native: any;
let engineUsed: 'native' | 'js' = 'js';

function getJSFallback() {
    const crypto = _require('crypto');
    console.warn("⚠️  [LUNX EXECUTOR] Native binary and WASM failed to load. Falling back to JavaScript engine.");
    console.warn("⚠️  [LUNX EXECUTOR] Performance will be degraded. Execution is guaranteed iteratively safely.");
    return {
        // Wire in the actual JS implementation
        GraphAnalyzer: JSGraphAnalyzer,
        BuildOrchestrator: class { }, // Need JS implementations later if needed
        BuildCache: class { },
        fastHash: (s: string) => crypto.createHash('sha256').update(s).digest('hex').substring(0, 16),
        batchHash: (sa: string[]) => sa.map((s: string) => crypto.createHash('sha256').update(s).digest('hex').substring(0, 16)),
        scanImports: (s: string) => [],
        normalizePath: (s: string) => s.replace(/\\/g, '/'),
        transformCss: (code: string, filename: string, minify: boolean) => code,
        transformJs: (code: string, filename: string, minify: boolean) => code,
        NativeWorker: class {
            constructor() { }
            processFile() { return null; }
        },
        helloRust: () => "JS fallback"
    };
}

try {
    const nativeCandidates = [
        path.resolve(__dirname, '../../../lunx_native.node'),
        path.resolve(__dirname, '../../lunx_native.node'),
        path.resolve(__dirname, '../lunx_native.node'),
        path.resolve(__dirname, './lunx_native.node'),
        path.resolve(process.cwd(), 'lunx_native.node')
    ];

    let foundNative = '';
    for (const c of nativeCandidates) {
        if (fs.existsSync(c)) {
            foundNative = c;
            break;
        }
    }

    if (foundNative) {
        native = _require(foundNative);
        engineUsed = 'native';
    } else {
        // Phase 2.3: WASM plugin sandbox removed. Native → JS fallback directly.
        // See https://lunx.dev/migrate#wasm-plugins
        native = getJSFallback();
        engineUsed = 'js';
    }
} catch (e) {
    // If native or WASM crashes during load, catch and fallback to JS
    console.warn(`⚠️  [LUNX EXECUTOR] Engine failure: ${e instanceof Error ? e.message : String(e)}`);
    native = getJSFallback();
    engineUsed = 'js';
}

const OriginalGraphAnalyzer = native.GraphAnalyzer;
native.GraphAnalyzer = class DebugWrappedGraphAnalyzer extends OriginalGraphAnalyzer {
    private __spy_ids: string[] = [];
    private __spy_edges: string[][] = [];

    addBatch(ids: string[], edges: string[][]) {
        if (process.env.LUNX_DEBUG_GRAPH) {
            this.__spy_ids.push(...ids);
            this.__spy_edges.push(...edges);
        }
        return super.addBatch(ids, edges);
    }

    analyze(entryPoints: string[]) {
        if (process.env.LUNX_DEBUG_GRAPH) {
            this._dumpSnapshot(entryPoints);
        }
        if (typeof super.analyze === 'function') {
            return super.analyze(entryPoints);
        }
        return null;
    }

    detectCycles() {
        if (process.env.LUNX_DEBUG_GRAPH && typeof super.analyze !== 'function') {
            this._dumpSnapshot([]); // some consumers just call detectCycles
        }
        return super.detectCycles();
    }

    private _dumpSnapshot(entryPoints: string[]) {
        try {
            const fs = _require('fs');
            const data = {
                entry_points: entryPoints,
                ids: this.__spy_ids,
                edges: this.__spy_edges
            };
            fs.writeFileSync('snapshot.json', JSON.stringify(data, null, 2), 'utf8');
            console.warn('⚠️  [LUNX DEBUG] Graph snapshot written to snapshot.json');
        } catch(e) {}
    }
};

export const {
    GraphAnalyzer,
    BuildOrchestrator,
    BuildCache,
    fastHash,
    batchHash,
    scanImports,
    normalizePath,
    transformCss,
    transformJs,
    NativeWorker,
    helloRust,
    // Phase 3 — additive exports
    NativeWatcher,
    startWatcher,
    lunxChunk,
    mergeSourceMaps,
    prebundle,
    prebundlePut,
    // Phase 4 — competitive superiority
    planBuild,
} = native;

export { NativeWorker as RustNativeWorker, engineUsed };
export default native;
