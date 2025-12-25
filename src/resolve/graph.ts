
import { canonicalHash } from '../core/engine/hash.js';
import { normalizePath, generateModuleId } from './utils.js';
import fs from 'fs/promises';
import path from 'path';

// Phase 1: Core Types

export type GraphEdgeKind = 'import' | 'dynamic_import' | 'require' | 'css_url' | 'worker' | 'css-import' | 'css-url' | 'js-style-import' | 'css-layer';

export type CSSImportPrecedence = {
  specificity: number;        // 0–1000
  sourceOrder: number;
  cascadeLayer?: string;     // @layer base|components|utilities
};

export interface GraphEdge {
  from: string; // Node ID
  to: string;   // Node ID
  kind: GraphEdgeKind;
  loc?: {
    start: { line: number, column: number };
    end: { line: number, column: number };
  }; // Source location
  condition?: string; // For conditional imports
  metadata?: Record<string, any>;
}

export interface GraphNode {
  id: string;             // canonicalHash(type + normalizedPath)
  type: 'file' | 'virtual' | 'css' | 'css-module' | 'style-asset' | 'css-in-js';
  path: string;           // Normalized absolute path
  contentHash: string;
  edges: GraphEdge[];     // Outgoing edges
  metadata?: Record<string, any>; // AI attribution, etc
  cssInJs?: {
    runtime: "styled-components" | "emotion" | "linaria";
    extractedCss: string;
  };
}

export interface GraphValidation {
  isValid: boolean;
  cycles: string[][]; // Array of cycles (each is array of Node IDs)
  errors: string[];
}

export interface DeltaGraph {
  added: GraphNode[];
  updated: GraphNode[];
  removed: string[]; // Node IDs
  timestamp: string;
}

export class DependencyGraph {
  nodes = new Map<string, GraphNode>();
  graphHash: string = '';

  // Phase 1 & 2 & 5: Construction

  async addEntry(entryPath: string, rootDir: string) {
    // Normalize
    const normalized = normalizePath(entryPath);
    const id = generateModuleId('file', normalized, rootDir);

    // Scan (Phase 3 currently placeholder)
    await this.scanAndAdd(id, 'file', normalized, rootDir);
  }

  private async scanAndAdd(id: string, type: 'file' | 'virtual', absPath: string, rootDir: string) {
    if (this.nodes.has(id)) return;

    let content = '';
    if (type === 'file') {
      try {
        content = await fs.readFile(absPath, 'utf-8');
      } catch (e) {
        // Handled by validation phase
        return;
      }
    }

    const node: GraphNode = {
      id,
      type,
      path: absPath,
      contentHash: canonicalHash(content),
      edges: []
    };

    this.nodes.set(id, node);

    // Phase 4: Extract Deps (Placeholder - reusing old recursive logic for now but mapped to new structure)
    // In full implementation, we parse AST here.
    // For this step, let's just do a basic regex or text scan to prove graph structure.

    const imports = this.parseImportsSimple(content, absPath);

    for (const depPath of imports) {
      const depAbs = normalizePath(depPath);
      const depId = generateModuleId('file', depAbs, rootDir);

      node.edges.push({
        from: id,
        to: depId,
        kind: 'import'
      });

      await this.scanAndAdd(depId, 'file', depAbs, rootDir);
    }
  }

  // Simple parser until Phase 3/4 specific AST implementation
  private parseImportsSimple(content: string, dir: string): string[] {
    const deps: string[] = [];
    const regex = /import\s+.*?from\s+['"](.*?)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const specifier = match[1];
      if (specifier.startsWith('.')) {
        deps.push(path.resolve(path.dirname(dir), specifier));
      }
    }
    return deps;
  }

  // Phase 6: Validation
  validate(): GraphValidation {
    const cycles: string[][] = [];
    const errors: string[] = [];

    // Cycle Detection (DFS)
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (nodeId: string, path: string[]) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        for (const edge of node.edges) {
          if (!visited.has(edge.to)) {
            detectCycle(edge.to, path);
          } else if (recursionStack.has(edge.to)) {
            // Cycle found!
            const cycleLoop = path.slice(path.indexOf(edge.to));
            cycles.push([...cycleLoop]);
          }
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        detectCycle(nodeId, []);
      }
    }

    return {
      isValid: errors.length === 0, // Cycles might be warnings in Dev
      cycles,
      errors
    };
  }

  // Phase 9: Graph Hashing
  computeHash(): string {
    // Sort Nodes by ID
    const sortedIds = Array.from(this.nodes.keys()).sort();

    const graphData = sortedIds.map(id => {
      const node = this.nodes.get(id)!;
      // Sort edges
      const sortedEdges = [...node.edges].sort((a, b) => {
        if (a.to !== b.to) return a.to.localeCompare(b.to);
        return a.kind.localeCompare(b.kind);
      });

      return {
        id: node.id,
        contentHash: node.contentHash,
        edges: sortedEdges.map(e => ({ to: e.to, kind: e.kind }))
      };
    });

    this.graphHash = canonicalHash(graphData);
    return this.graphHash;
  }
}
