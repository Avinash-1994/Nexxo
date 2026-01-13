import { canonicalHash } from '../core/engine/hash.js';
import { normalizePath, generateModuleId } from './utils.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import esbuild from 'esbuild';
import { PluginManager } from '../core/plugins/manager.js';
import { scanImports } from '../native/index.js';

// Phase 1: Core Types

export type GraphEdgeKind = 'import' | 'dynamic-import' | 'dynamic_import' | 'require' | 'css_url' | 'worker' | 'css-import' | 'css-url' | 'js-style-import' | 'css-layer';

export type CSSImportPrecedence = {
  specificity: number;        // 0–1000
  sourceOrder: number;
  cascadeLayer?: string;     // @layer base|components|utilities
};

/** @public */
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
  target?: 'client' | 'server' | 'edge' | 'universal'; // Target affinity (Phase 4)
}

/** @public */
export interface GraphNode {
  id: string;             // canonicalHash(type + normalizedPath)
  type: 'file' | 'virtual' | 'css' | 'css-module' | 'style-asset' | 'css-in-js';
  path: string;           // Normalized absolute path
  contentHash: string;
  edges: GraphEdge[];     // Outgoing edges
  specifierMap?: Record<string, string>; // Mapping of original specifiers to target IDs
  metadata?: Record<string, any>; // AI attribution, etc
  target?: 'client' | 'server' | 'edge' | 'universal'; // Node affinity (Phase 4)
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

/**
 * Dependency Graph Implementation
 */
export class DependencyGraph {
  nodes = new Map<string, GraphNode>();
  graphHash: string = '';
  private pluginManager: PluginManager | null = null;

  constructor(pluginManager?: PluginManager) {
    this.pluginManager = pluginManager || null;
  }

  async addEntry(entryPath: string, rootDir: string) {
    const normalized = normalizePath(entryPath);
    const type = this.detectType(normalized);
    const id = generateModuleId(type, normalized, rootDir);
    await this.scanAndAdd(id, type, normalized, rootDir);
  }

  private detectType(p: string): GraphNode['type'] {
    if (p.endsWith('.css')) return 'css';
    if (p.endsWith('.module.css')) return 'css-module';
    const ext = path.extname(p).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf'].includes(ext)) {
      return 'style-asset';
    }
    return 'file';
  }

  private async scanAndAdd(id: string, type: GraphNode['type'], absPath: string, rootDir: string, target: GraphNode['target'] = 'universal', force: boolean = false) {
    const existing = this.nodes.get(id);
    if (existing && !force) return;

    let content: string | Buffer = '';

    if (this.pluginManager) {
      const result = await this.pluginManager.runHook('load', { path: absPath, id: id });
      if (result && typeof result.code === 'string') {
        content = result.code;
        if (type === 'style-asset') type = 'file';
      }
    }

    if (!content) {
      if (type === 'file' || type === 'css' || type === 'css-module') {
        try { content = await fs.readFile(absPath, 'utf-8'); } catch (e) { return; }
      } else if (type === 'style-asset') {
        try { content = await fs.readFile(absPath); } catch (e) { return; }
      }
    }

    const contentHash = canonicalHash(typeof content === 'string' ? content.replace(/\r\n/g, '\n') : content);

    if (existing && existing.contentHash === contentHash && !force) {
      if (existing.type !== type) existing.type = type;
      return;
    }

    const node: GraphNode = { id, type, path: absPath, contentHash, edges: [], target };
    this.nodes.set(id, node);

    const imports = typeof content === 'string' ? await this.parseImportsSimple(content, absPath) : [];
    node.specifierMap = {};

    for (const { original, resolved, kind } of imports) {
      const depAbs = normalizePath(resolved);
      const depType = this.detectType(depAbs);
      const depId = generateModuleId(depType, depAbs, rootDir);
      node.specifierMap[original] = depId;
      node.edges.push({ from: id, to: depId, kind: kind as any, target });
      await this.scanAndAdd(depId, depType, depAbs, rootDir, target);
    }
  }

  private async parseImportsSimple(content: string, filePath: string): Promise<{ original: string, resolved: string, kind: string }[]> {
    const deps: { specifier: string, kind: string }[] = [];
    const ext = path.extname(filePath);

    if (!['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'].includes(ext)) {
      return [];
    }

    // 1. FAST NATIVE SCAN (Phase 4.2 Hot Path)
    try {
      const nativeDeps = scanImports(content);
      nativeDeps.forEach((specifier: string) => deps.push({ specifier, kind: 'import' }));
      // If we found deps with native scanner, we can skip the expensive AST parse for simple graphs
      if (deps.length > 0) {
        return this.resolveAll(deps, filePath);
      }
    } catch (e) {
      // Fallback to JS if native fails
    }

    // 2. JS FALLBACK (Full AST for complex cases)
    let jsContent = content;
    try {
      const transpileResult = await esbuild.transform(content, {
        loader: ext.slice(1) as any,
        format: 'esm',
        target: 'esnext'
      });
      jsContent = transpileResult.code;
    } catch (e) { }

    try {
      const ast = acorn.parse(jsContent, { sourceType: 'module', ecmaVersion: 'latest', allowImportExportEverywhere: true });
      walk.simple(ast, {
        ImportDeclaration(node: any) { if (node.source.value) deps.push({ specifier: node.source.value, kind: 'import' }); },
        ExportNamedDeclaration(node: any) { if (node.source?.value) deps.push({ specifier: node.source.value, kind: 'import' }); },
        ExportAllDeclaration(node: any) { if (node.source.value) deps.push({ specifier: node.source.value, kind: 'import' }); },
        CallExpression(node: any) {
          if (node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments[0]?.type === 'Literal') {
            deps.push({ specifier: node.arguments[0].value, kind: 'require' });
          }
        },
        ImportExpression(node: any) { if (node.source.type === 'Literal') deps.push({ specifier: node.source.value, kind: 'dynamic-import' }); }
      });
    } catch (e) {
      const regex = /(?:import|export)\s+.*?\s+from\s+['"](.*?)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) deps.push({ specifier: match[1], kind: 'import' });
    }

    return this.resolveAll(deps, filePath);
  }

  private async resolveAll(deps: { specifier: string, kind: string }[], filePath: string) {
    const resolvedDeps: { original: string, resolved: string, kind: string }[] = [];
    const dir = path.dirname(filePath);
    for (const dep of deps) {
      const resolved = await this.resolvePath(dep.specifier, dir);
      if (resolved) resolvedDeps.push({ original: dep.specifier, resolved, kind: dep.kind });
    }
    return resolvedDeps;
  }

  private async resolvePath(specifier: string, dir: string): Promise<string | null> {
    if (this.pluginManager) {
      const result = await this.pluginManager.runHook('resolveId', { source: specifier, importer: dir });
      if (result && result.id) {
        let absResult = path.isAbsolute(result.id) ? result.id : path.resolve(dir, result.id);
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'];
        if (existsSync(absResult) && (await fs.stat(absResult)).isFile()) return absResult;
        for (const ext of extensions) { if (existsSync(absResult + ext)) return absResult + ext; }
        for (const ext of extensions) {
          const indexPath = path.join(absResult, 'index' + ext);
          if (existsSync(indexPath)) return indexPath;
        }
        return result.id;
      }
    }

    if (!specifier.startsWith('.') && !path.isAbsolute(specifier)) return null;

    const absPath = path.resolve(dir, specifier);
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css'];
    if (existsSync(absPath)) {
      const stat = await fs.stat(absPath);
      if (stat.isFile()) return absPath;
    }
    for (const ext of extensions) { if (existsSync(absPath + ext)) return absPath + ext; }
    for (const ext of extensions) {
      const indexPath = path.join(absPath, 'index' + ext);
      if (existsSync(indexPath)) return indexPath;
    }
    return null;
  }

  validate(): GraphValidation {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (nodeId: string, path: string[]) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);
      const node = this.nodes.get(nodeId);
      if (node) {
        for (const edge of node.edges) {
          if (!visited.has(edge.to)) detectCycle(edge.to, path);
          else if (recursionStack.has(edge.to)) cycles.push([...path.slice(path.indexOf(edge.to))]);
        }
      }
      recursionStack.delete(nodeId);
      path.pop();
    };

    for (const nodeId of this.nodes.keys()) { if (!visited.has(nodeId)) detectCycle(nodeId, []); }
    return { isValid: true, cycles, errors: [] };
  }

  computeHash(): string {
    const sortedIds = Array.from(this.nodes.keys()).sort();
    const graphData = sortedIds.map(id => {
      const node = this.nodes.get(id)!;
      const sortedEdges = [...node.edges].sort((a, b) => a.to.localeCompare(b.to) || a.kind.localeCompare(b.kind));
      return { id: node.id, contentHash: node.contentHash, edges: sortedEdges.map(e => ({ to: e.to, kind: e.kind })) };
    });
    this.graphHash = canonicalHash(graphData);
    return this.graphHash;
  }

  async invalidate(filePath: string, rootDir: string) {
    const normalized = normalizePath(filePath);
    const type = this.detectType(normalized);
    const id = generateModuleId(type, normalized, rootDir);
    if (this.nodes.has(id)) await this.scanAndAdd(id, type, normalized, rootDir, 'universal', true);
    else await this.addEntry(filePath, rootDir);
  }
}
