
/**
 * Nexxo Dependency Graph Visualizer Engine
 * Logic Layer for WebGPU Visualizer
 * Day 16: WebGPU Visualizer v2 Lock
 */

export interface HelperNode {
    id: string;
    size: number; // Bytes
    importers: string[];
    imported: string[];
    // Computed Metrics
    centrality?: number;
    shakeable?: boolean;
}

export interface OptimizationHint {
    type: 'split' | 'shake' | 'duplicate';
    nodeId: string;
    message: string;
    impact: 'high' | 'medium' | 'low';
}

export class VisualizerEngine {
    nodes: Map<string, HelperNode>;

    constructor(nodes: HelperNode[]) {
        this.nodes = new Map(nodes.map(n => [n.id, n]));
    }

    /**
     * Calculate Graph Metrics (Centrality, Depth)
     * O(N) pass
     */
    analyze(): OptimizationHint[] {
        const hints: OptimizationHint[] = [];

        for (const [id, node] of this.nodes) {
            // 1. Centrality (In-degree)
            const inDegree = node.importers.length;
            node.centrality = inDegree;

            // 2. Identify "Hubs" (High impact split candidates)
            // If a node is imported by many (>50) and large (>50KB)
            if (inDegree > 50 && node.size > 50000) {
                hints.push({
                    type: 'split',
                    nodeId: id,
                    message: `Hub detected: Imported by ${inDegree} modules. Consider lazy loading.`,
                    impact: 'high'
                });
            }

            // 3. Identify Shakeable (Leaf nodes with 0 importers - entry points excepted)
            // If not entry point and 0 importers -> Dead code?
            // (Assuming we provided full graph including entry points)
            if (inDegree === 0 && !id.includes('index') && !id.includes('main')) {
                hints.push({
                    type: 'shake',
                    nodeId: id,
                    message: 'Orphan module detected (0 importers). Verify if entry point.',
                    impact: 'medium'
                });
            }

            // 4. Duplicate Packages (e.g. lodash vs lodash-es)
            if (id.includes('node_modules')) {
                // Implementation would be more complex regex
            }
        }

        return hints;
    }

    /**
     * Generate WebGPU-ready buffer data (Mock)
     * Flattens graph into Float32Arrays for position/color
     */
    generateLayoutData() {
        // In a real app, this runs Force-Directed Simulation (d3-force or similar)
        // For 10k nodes, we'd do this in a Worker or Compute Shader.
        // Here we just return the size to prove we processed it.
        return {
            nodeCount: this.nodes.size,
            edgeCount: Array.from(this.nodes.values()).reduce((acc, n) => acc + n.imported.length, 0),
            // Mock buffer sizes
            positionBuffer: new Float32Array(this.nodes.size * 3), // x,y,z
            colorBuffer: new Float32Array(this.nodes.size * 3)     // r,g,b
        };
    }
}
