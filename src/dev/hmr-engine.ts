
import { DependencyGraph } from '../resolve/graph.js';
import { InteropEngine, ExportMap } from '../core/interop/index.js';
import { HMRDecision, HMRBoundary, HMRDecisionTrace } from './types.js';
import { explainReporter } from '../core/engine/events.js';
import { canonicalHash } from '../core/engine/hash.js';

export class HMRDecisionEngine {
    private shapeCache: Map<string, string> = new Map();

    constructor(
        private graph: DependencyGraph,
        private interop: InteropEngine
    ) { }

    async decide(changedFiles: string[]): Promise<HMRDecisionTrace> {
        const trace: HMRDecisionTrace = {
            changeSet: changedFiles,
            affectedModules: [],
            boundaries: [],
            decision: 'hot-update',
            decidedBy: 'server'
        };

        for (const file of changedFiles) {
            const nodeId = file;
            trace.affectedModules.push(nodeId);

            // 5.7 Export Shape Hashing
            const { exports } = await this.interop.processModule(file);
            const currentShapeHash = this.computeShapeHash(exports);
            const previousShapeHash = this.shapeCache.get(nodeId);

            if (previousShapeHash && currentShapeHash !== previousShapeHash) {
                explainReporter.report('hmr', 'reload', `Export shape changed in ${file}. Reload required.`);
                trace.boundaries.push({
                    moduleId: nodeId,
                    boundaryType: 'reload-required',
                    reason: 'Export shape mismatch'
                });
                trace.decision = 'reload';
                // Don't update cache yet, let reload happen
                return trace;
            }

            this.shapeCache.set(nodeId, currentShapeHash);

            // 5.5 HMR Decision Rules
            // If No reload-required yet, continue checking
            trace.boundaries.push({
                moduleId: nodeId,
                boundaryType: 'safe',
                reason: 'Export shape stable'
            });
        }

        return trace;
    }

    private computeShapeHash(map: ExportMap): string {
        const sortedNamed = Array.from(map.named).sort();
        return canonicalHash({
            named: sortedNamed,
            hasDefault: map.hasDefault,
            isDynamic: map.isDynamic
        });
    }

    // Initialize cache for all nodes
    async seed(nodeIds: string[]) {
        for (const id of nodeIds) {
            try {
                const { exports } = await this.interop.processModule(id);
                this.shapeCache.set(id, this.computeShapeHash(exports));
            } catch {
                // Skip missing files
            }
        }
    }
}
