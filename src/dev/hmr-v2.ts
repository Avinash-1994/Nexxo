
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

        // Update imports
        existing.imported = new Set(imported);
        existing.isSelfAccepting = isSelfAccepting;

        // Update importers (reverse graph)
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
        const node = this.graph.get(file);

        if (!node) {
            return { type: 'full-reload', path: file, acceptedPath: file, timestamp };
        }

        // 1. If self-accepting, we stop here (e.g. Vue components, React fast refresh roots)
        if (node.isSelfAccepting) {
            return { type: 'js-update', path: file, acceptedPath: file, timestamp };
        }

        // 2. CSS is always self-accepting in our engine
        if (file.endsWith('.css')) {
            return { type: 'css-update', path: file, acceptedPath: file, timestamp };
        }

        // 3. Walk up importers to find a boundary
        // For simplicity in Day 5, we check immediate parents. 
        // A full graph walk would be recursive.
        const importers = Array.from(node.importers);
        if (importers.length === 0) {
            // Entry point changed? Full reload.
            return { type: 'full-reload', path: file, acceptedPath: file, timestamp };
        }

        // Check if all importers can accept this update
        // (Simplified: if any importer is self-accepting, we assume it handles the update for now)
        for (const importerId of importers) {
            const importer = this.graph.get(importerId);
            if (importer && importer.isSelfAccepting) {
                // The parent accepts the update (bubble up)
                return { type: 'js-update', path: file, acceptedPath: importerId, timestamp };
            }
        }

        // No accepted boundary found -> Full reload
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
