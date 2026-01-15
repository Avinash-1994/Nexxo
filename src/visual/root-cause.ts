import type { DependencyGraph } from '../resolve/graph.js';
import type { BuildContext } from '../core/engine/types.js';

/**
 * Root Cause Analysis System
 * Analyzes dependency graphs to identify root causes of build issues
 */

export interface RootCauseNode {
    id: string;
    path: string;
    type: 'entry' | 'module' | 'dependency' | 'asset';
    size: number;
    imports: string[];
    importedBy: string[];
    issues: RootCauseIssue[];
}

export interface RootCauseIssue {
    type: 'bundle-bloat' | 'unused-dep' | 'dead-code' | 'circular-dep' | 'duplicate-module';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    fix?: string;
    affectedNodes: string[];
}

export interface GraphSlice {
    nodes: Map<string, RootCauseNode>;
    edges: Array<{ from: string; to: string }>;
    rootCause: RootCauseIssue;
}

export class RootCauseAnalyzer {
    private graph: DependencyGraph;
    private ctx: BuildContext;
    private nodeCache: Map<string, RootCauseNode> = new Map();

    constructor(graph: DependencyGraph, ctx: BuildContext) {
        this.graph = graph;
        this.ctx = ctx;
    }

    /**
     * Analyze graph for root causes
     */
    analyze(): RootCauseIssue[] {
        const issues: RootCauseIssue[] = [];

        // Detect bundle bloat
        issues.push(...this.detectBundleBloat());

        // Detect unused dependencies
        issues.push(...this.detectUnusedDependencies());

        // Detect circular dependencies
        issues.push(...this.detectCircularDependencies());

        // Detect duplicate modules
        issues.push(...this.detectDuplicateModules());

        return issues;
    }

    /**
     * Create a graph slice for a specific issue
     */
    createSlice(issue: RootCauseIssue): GraphSlice {
        const nodes = new Map<string, RootCauseNode>();
        const edges: Array<{ from: string; to: string }> = [];

        // Build subgraph for affected nodes
        for (const nodeId of issue.affectedNodes) {
            const node = this.getOrCreateNode(nodeId);
            if (node) {
                nodes.set(nodeId, node);

                // Add edges
                for (const importId of node.imports) {
                    if (issue.affectedNodes.includes(importId)) {
                        edges.push({ from: nodeId, to: importId });
                    }
                }
            }
        }

        return { nodes, edges, rootCause: issue };
    }

    /**
     * Get path from entry to problematic module
     */
    getImportPath(targetId: string): string[] {
        const visited = new Set<string>();
        const path: string[] = [];

        const dfs = (nodeId: string): boolean => {
            if (visited.has(nodeId)) return false;
            visited.add(nodeId);
            path.push(nodeId);

            if (nodeId === targetId) return true;

            const node = this.graph.nodes.get(nodeId);
            if (node && node.edges) {
                for (const edge of node.edges) {
                    if (dfs(edge.to)) return true;
                }
            }

            path.pop();
            return false;
        };

        // Start from entry points
        for (const [nodeId, node] of this.graph.nodes) {
            if (node.metadata?.isEntry) {
                if (dfs(nodeId)) break;
            }
        }

        return path;
    }

    /**
     * Export graph data for visualization
     */
    exportForVisualization(): {
        nodes: RootCauseNode[];
        edges: Array<{ from: string; to: string }>;
        issues: RootCauseIssue[];
    } {
        const nodes: RootCauseNode[] = [];
        const edges: Array<{ from: string; to: string }> = [];

        for (const [nodeId, graphNode] of this.graph.nodes) {
            const node = this.getOrCreateNode(nodeId);
            if (node) {
                nodes.push(node);

                for (const depId of node.imports) {
                    edges.push({ from: nodeId, to: depId });
                }
            }
        }

        return {
            nodes,
            edges,
            issues: this.analyze()
        };
    }

    /**
     * Detect bundle bloat issues
     */
    private detectBundleBloat(): RootCauseIssue[] {
        const issues: RootCauseIssue[] = [];
        const sizeThreshold = 100 * 1024; // 100KB

        for (const [nodeId, node] of this.graph.nodes) {
            const size = node.metadata?.size || 0;
            if (size > sizeThreshold) {
                issues.push({
                    type: 'bundle-bloat',
                    severity: 'warning',
                    message: `Large module detected: ${node.path} (${(size / 1024).toFixed(2)}KB)`,
                    fix: 'Consider code splitting or lazy loading this module',
                    affectedNodes: [nodeId]
                });
            }
        }

        return issues;
    }

    /**
     * Detect unused dependencies
     */
    private detectUnusedDependencies(): RootCauseIssue[] {
        const issues: RootCauseIssue[] = [];
        const referenced = new Set<string>();

        // Mark all referenced modules
        for (const [, node] of this.graph.nodes) {
            if (node.edges) {
                node.edges.forEach(edge => referenced.add(edge.to));
            }
        }

        // Find unreferenced modules (except entries)
        for (const [nodeId, node] of this.graph.nodes) {
            if (!node.metadata?.isEntry && !referenced.has(nodeId)) {
                issues.push({
                    type: 'unused-dep',
                    severity: 'info',
                    message: `Unused module: ${node.path}`,
                    fix: 'Remove this module if it\'s not needed',
                    affectedNodes: [nodeId]
                });
            }
        }

        return issues;
    }

    /**
     * Detect circular dependencies
     */
    private detectCircularDependencies(): RootCauseIssue[] {
        const issues: RootCauseIssue[] = [];
        const visiting = new Set<string>();
        const visited = new Set<string>();

        const detectCycle = (nodeId: string, path: string[]): string[] | null => {
            if (visiting.has(nodeId)) {
                // Found cycle
                const cycleStart = path.indexOf(nodeId);
                return path.slice(cycleStart);
            }

            if (visited.has(nodeId)) return null;

            visiting.add(nodeId);
            path.push(nodeId);

            const node = this.graph.nodes.get(nodeId);
            if (node && node.edges) {
                for (const edge of node.edges) {
                    const cycle = detectCycle(edge.to, [...path]);
                    if (cycle) return cycle;
                }
            }

            visiting.delete(nodeId);
            visited.add(nodeId);
            return null;
        };

        for (const [nodeId] of this.graph.nodes) {
            if (!visited.has(nodeId)) {
                const cycle = detectCycle(nodeId, []);
                if (cycle) {
                    issues.push({
                        type: 'circular-dep',
                        severity: 'warning',
                        message: `Circular dependency detected: ${cycle.map(id => {
                            const node = this.graph.nodes.get(id);
                            return node?.path || id;
                        }).join(' → ')}`,
                        fix: 'Refactor to remove circular dependency',
                        affectedNodes: cycle
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Detect duplicate modules
     */
    private detectDuplicateModules(): RootCauseIssue[] {
        const issues: RootCauseIssue[] = [];
        const pathMap = new Map<string, string[]>();

        // Group by normalized path
        for (const [nodeId, node] of this.graph.nodes) {
            const normalizedPath = node.path.replace(/\\/g, '/');
            const ids = pathMap.get(normalizedPath) || [];
            ids.push(nodeId);
            pathMap.set(normalizedPath, ids);
        }

        // Find duplicates
        for (const [path, ids] of pathMap) {
            if (ids.length > 1) {
                issues.push({
                    type: 'duplicate-module',
                    severity: 'warning',
                    message: `Duplicate module detected: ${path} (${ids.length} instances)`,
                    fix: 'Ensure consistent module resolution',
                    affectedNodes: ids
                });
            }
        }

        return issues;
    }

    /**
     * Get or create root cause node
     */
    private getOrCreateNode(nodeId: string): RootCauseNode | null {
        if (this.nodeCache.has(nodeId)) {
            return this.nodeCache.get(nodeId)!;
        }

        const graphNode = this.graph.nodes.get(nodeId);
        if (!graphNode) return null;

        const node: RootCauseNode = {
            id: nodeId,
            path: graphNode.path,
            type: graphNode.metadata?.isEntry ? 'entry' : 'module',
            size: graphNode.metadata?.size || 0,
            imports: graphNode.edges?.map(e => e.to) || [],
            importedBy: [],
            issues: []
        };

        // Find importers
        for (const [otherId, otherNode] of this.graph.nodes) {
            if (otherNode.edges?.some(e => e.to === nodeId)) {
                node.importedBy.push(otherId);
            }
        }

        this.nodeCache.set(nodeId, node);
        return node;
    }
}

/**
 * Export graph data in shareable format
 */
export function exportGraphData(analyzer: RootCauseAnalyzer): string {
    const data = analyzer.exportForVisualization();
    return JSON.stringify(data, null, 2);
}
