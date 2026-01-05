/**
 * JavaScript Graph Analyzer (for benchmarking against Rust)
 * 
 * Pure TypeScript implementation of graph algorithms
 * Used to measure performance gains from Rust native module
 */

export interface CircularDependency {
    cycle: string[];
    entryPoint: string;
}

export interface GraphAnalysisResult {
    hasCycles: boolean;
    cycles: CircularDependency[];
    orphanedNodes: string[];
    entryPoints: string[];
    totalNodes: number;
    totalEdges: number;
}

export class JSGraphAnalyzer {
    private nodes: Map<string, string[]> = new Map();

    addNode(id: string, dependencies: string[]): void {
        this.nodes.set(id, dependencies);
    }

    /**
     * Detect circular dependencies using DFS
     * Time complexity: O(V + E)
     */
    /**
     * Detect circular dependencies using Iterative DFS
     * Time complexity: O(V + E)
     * 
     * Rewritten to be Iterative to avoid Stack Overflow on large graphs.
     * Complies with "No Recursive Traversal" rule.
     */
    detectCycles(): CircularDependency[] {
        const cycles: CircularDependency[] = [];
        const visited = new Set<string>();
        const onStack = new Set<string>();
        const path: string[] = [];

        // Stack mimics the recursion: { node, childIndex }
        // Using explicit stack allows scaling to heap limits instead of stack limits
        const stack: { node: string; childIndex: number }[] = [];

        for (const startNode of this.nodes.keys()) {
            if (visited.has(startNode)) continue;

            // Start DFS
            stack.push({ node: startNode, childIndex: 0 });
            visited.add(startNode);
            onStack.add(startNode);
            path.push(startNode);

            while (stack.length > 0) {
                const peek = stack[stack.length - 1];
                const { node, childIndex } = peek;
                const deps = this.nodes.get(node) || [];

                if (childIndex < deps.length) {
                    // Process next child
                    peek.childIndex++; // Move to next child for when we return
                    const dep = deps[childIndex];

                    if (!visited.has(dep)) {
                        visited.add(dep);
                        onStack.add(dep);
                        path.push(dep);
                        stack.push({ node: dep, childIndex: 0 });
                    } else if (onStack.has(dep)) {
                        // Cycle detected
                        const cycleStart = path.indexOf(dep);
                        if (cycleStart !== -1) {
                            cycles.push({
                                cycle: path.slice(cycleStart),
                                entryPoint: dep
                            });
                        }
                    }
                } else {
                    // Finished processing all children
                    onStack.delete(node);
                    path.pop();
                    stack.pop();
                }
            }
        }

        return cycles;
    }

    // Removed recursive dfsDetectCycle helper

    /**
     * Find orphaned nodes using BFS
     * Time complexity: O(V + E)
     */
    findOrphanedNodes(entryPoints: string[]): string[] {
        const reachable = new Set<string>();
        const queue: string[] = [...entryPoints];

        // BFS from all entry points
        for (const entry of entryPoints) {
            reachable.add(entry);
        }

        while (queue.length > 0) {
            const node = queue.shift()!;
            const deps = this.nodes.get(node) || [];

            for (const dep of deps) {
                if (!reachable.has(dep)) {
                    reachable.add(dep);
                    queue.push(dep);
                }
            }
        }

        // Find orphaned nodes
        const orphaned: string[] = [];
        for (const node of this.nodes.keys()) {
            if (!reachable.has(node)) {
                orphaned.push(node);
            }
        }

        return orphaned;
    }

    /**
     * Topological sort using Kahn's algorithm
     * Time complexity: O(V + E)
     */
    topologicalSort(): string[] | null {
        const inDegree = new Map<string, number>();
        const result: string[] = [];
        const queue: string[] = [];

        // Calculate in-degrees
        for (const node of this.nodes.keys()) {
            inDegree.set(node, 0);
        }
        for (const deps of this.nodes.values()) {
            for (const dep of deps) {
                inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
            }
        }

        // Find nodes with in-degree 0
        for (const [node, degree] of inDegree.entries()) {
            if (degree === 0) {
                queue.push(node);
            }
        }

        // Process nodes
        while (queue.length > 0) {
            const node = queue.shift()!;
            result.push(node);

            const deps = this.nodes.get(node) || [];
            for (const dep of deps) {
                const degree = inDegree.get(dep)! - 1;
                inDegree.set(dep, degree);
                if (degree === 0) {
                    queue.push(dep);
                }
            }
        }

        // If result doesn't contain all nodes, there's a cycle
        return result.length === this.nodes.size ? result : null;
    }

    /**
     * Complete graph analysis
     */
    analyze(entryPoints: string[]): GraphAnalysisResult {
        const cycles = this.detectCycles();
        const orphanedNodes = this.findOrphanedNodes(entryPoints);

        let totalEdges = 0;
        for (const deps of this.nodes.values()) {
            totalEdges += deps.length;
        }

        return {
            hasCycles: cycles.length > 0,
            cycles,
            orphanedNodes,
            entryPoints,
            totalNodes: this.nodes.size,
            totalEdges
        };
    }

    nodeCount(): number {
        return this.nodes.size;
    }

    edgeCount(): number {
        let count = 0;
        for (const deps of this.nodes.values()) {
            count += deps.length;
        }
        return count;
    }

    clear(): void {
        this.nodes.clear();
    }
}
