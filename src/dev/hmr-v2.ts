
/**
 * Delta HMR Engine (v2.0)
 * Day 5: Module 1 - Speed Mastery
 * 
 * Implements a high-performance graph diffing engine for HMR.
 * Calculates minimal update set for <10ms HMR latency.
 */

import { log } from '../utils/logger.js';
import path from 'path';

export interface HMRUpdate {
    type: 'js-update' | 'css-update' | 'full-reload';
    path: string;
    acceptedPath: string;
    timestamp: number;
    content?: string; // For CSS or partial content
}

export interface ModuleNode {
    id: string; // Absolute path
    importers: Set<string>;
    imported: Set<string>;
    isSelfAccepting: boolean;
    lastHmrTimestamp: number;
}

export class HMREngine {
    private graph: Map<string, ModuleNode> = new Map();
    private dirtyModules: Set<string> = new Set();

    constructor(private root: string) {
        log.info('🚀 Initialized Delta HMR Engine (v2.0)');
    }

    /**
     * Register a module in the dependency graph
     */
    registerModule(id: string, imported: string[], isSelfAccepting: boolean = false) {
        const existing = this.ensureNode(id);

        // Remove stale reverse-import links from any previously imported modules.
        for (const previousDep of existing.imported) {
            if (!imported.includes(previousDep)) {
                const previousDepNode = this.graph.get(previousDep);
                previousDepNode?.importers.delete(id);
            }
        }

        // Update imports and self-accepting state.
        existing.imported = new Set(imported);
        existing.isSelfAccepting = isSelfAccepting;

        // Update importers for the new dependency list.
        for (const dep of imported) {
            const depNode = this.ensureNode(dep);
            depNode.importers.add(id);
        }
    }

    /**
     * Propagate an update through the graph to find the HMR boundary
     */
    propagateUpdate(file: string): HMRUpdate | null {
        const timestamp = Date.now();

        // 1. CSS is always self-accepting in our engine, even if not registered.
        if (file.endsWith('.css')) {
            return { type: 'css-update', path: file, acceptedPath: file, timestamp };
        }

        const node = this.graph.get(file);
        if (!node) {
            return { type: 'full-reload', path: file, acceptedPath: file, timestamp };
        }

        // 2. If self-accepting, we stop here.
        if (node.isSelfAccepting) {
            node.lastHmrTimestamp = timestamp;
            return { type: 'js-update', path: file, acceptedPath: file, timestamp };
        }

        // 3. Breadth-first search for the nearest accepting importer boundary.
        const queue = Array.from(node.importers);
        const visited = new Set<string>(queue);
        let processed = 0;
        const maxSteps = 2000;

        while (queue.length > 0) {
            if (++processed > maxSteps) {
                log.warn(`[HMR] HMR graph traversal exceeded ${maxSteps} steps, falling back to full reload.`);
                return { type: 'full-reload', path: file, acceptedPath: file, timestamp };
            }

            const importerId = queue.shift()!;
            const importer = this.graph.get(importerId);

            if (!importer) {
                continue;
            }

            if (importer.isSelfAccepting) {
                importer.lastHmrTimestamp = timestamp;
                return { type: 'js-update', path: file, acceptedPath: importerId, timestamp };
            }

            if (importer.importers.has(file)) {
                // Circular dependency detected; prefer safe full reload.
                log.warn(`[HMR] Circular dependency detected for ${path.basename(file)}, triggering full reload.`);
                return { type: 'full-reload', path: file, acceptedPath: file, timestamp };
            }

            for (const nextImporter of importer.importers) {
                if (!visited.has(nextImporter)) {
                    visited.add(nextImporter);
                    queue.push(nextImporter);
                }
            }
        }

        log.warn(`[HMR] No accepting boundary found for ${path.basename(file)}, triggering full reload.`);
        return { type: 'full-reload', path: file, acceptedPath: file, timestamp };
    }

    private ensureNode(id: string): ModuleNode {
        if (!this.graph.has(id)) {
            this.graph.set(id, {
                id,
                importers: new Set(),
                imported: new Set(),
                isSelfAccepting: false,
                lastHmrTimestamp: 0
            });
        }
        return this.graph.get(id)!;
    }

    getStats() {
        return {
            modules: this.graph.size,
            edges: Array.from(this.graph.values()).reduce((acc, n) => acc + n.imported.size, 0)
        };
    }
}
