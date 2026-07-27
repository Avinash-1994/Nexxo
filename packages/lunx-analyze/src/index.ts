/**
 * Phase 1.18 — Bundle Analyser: lunx analyze, lunx why, lunx check
 */

export interface ModuleNode {
  id: string;          // module path/identifier
  size: number;        // bytes
  deps: string[];      // module ids this depends on
  usedExports?: string[];
}

export interface BundleGraph {
  modules: ModuleNode[];
  entry: string;
  totalSize: number;
}

// ─── lunx --analyze ──────────────────────────────────────────────────────────

export interface TreemapNode {
  id: string;
  label: string;
  size: number;
  children: TreemapNode[];
}

export function buildTreemap(graph: BundleGraph): TreemapNode {
  const modMap = new Map(graph.modules.map(m => [m.id, m]));

  function buildNode(id: string, visited = new Set<string>()): TreemapNode {
    if (visited.has(id)) return { id, label: id.split('/').pop() ?? id, size: 0, children: [] };
    visited.add(id);
    const mod = modMap.get(id);
    if (!mod) return { id, label: id.split('/').pop() ?? id, size: 0, children: [] };
    return {
      id,
      label: id.split('/').pop() ?? id,
      size: mod.size,
      children: mod.deps.map(dep => buildNode(dep, new Set(visited))),
    };
  }

  return buildNode(graph.entry);
}

// ─── lunx why <module> ───────────────────────────────────────────────────────

export interface WhyResult {
  found: boolean;
  chain: string[];   // dependency chain from entry → ... → module
  reason: string;
}

export function whyModule(graph: BundleGraph, target: string): WhyResult {
  const depMap = new Map(graph.modules.map(m => [m.id, m.deps]));

  function dfs(current: string, visited: Set<string>, path: string[]): string[] | null {
    if (current === target) return path;
    if (visited.has(current)) return null;
    visited.add(current);
    for (const dep of depMap.get(current) ?? []) {
      const result = dfs(dep, visited, [...path, dep]);
      if (result) return result;
    }
    return null;
  }

  const chain = dfs(graph.entry, new Set(), [graph.entry]);
  if (chain) {
    return {
      found: true,
      chain,
      reason: `Imported via ${chain.slice(0, -1).join(' → ')} → ${target}`,
    };
  }
  return { found: false, chain: [], reason: `Module "${target}" not found in bundle` };
}

// ─── lunx check ─────────────────────────────────────────────────────────────

export interface CheckIssue {
  type: 'circular' | 'ts-error' | 'unused-export' | 'large-module';
  module: string;
  message: string;
  severity: 'error' | 'warning';
}

export function checkBundle(graph: BundleGraph): CheckIssue[] {
  const issues: CheckIssue[] = [];

  // 1. Detect circular dependencies
  const depMap = new Map(graph.modules.map(m => [m.id, m.deps]));
  const inStack = new Set<string>();
  const visited = new Set<string>();

  function detectCycles(id: string, path: string[]) {
    if (inStack.has(id)) {
      const cycleStart = path.indexOf(id);
      const cycle = path.slice(cycleStart).concat(id).join(' → ');
      issues.push({ type: 'circular', module: id, message: `Circular dependency: ${cycle}`, severity: 'error' });
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    inStack.add(id);
    for (const dep of depMap.get(id) ?? []) {
      detectCycles(dep, [...path, id]);
    }
    inStack.delete(id);
  }

  for (const mod of graph.modules) detectCycles(mod.id, []);

  // 2. Flag large modules (> 100KB)
  for (const mod of graph.modules) {
    if (mod.size > 100_000) {
      issues.push({
        type: 'large-module',
        module: mod.id,
        message: `Large module: ${(mod.size / 1024).toFixed(1)}KB (consider code-splitting)`,
        severity: 'warning',
      });
    }
  }

  // 3. Unused exports (if usedExports provided)
  for (const mod of graph.modules) {
    if (mod.usedExports !== undefined && mod.usedExports.length === 0) {
      issues.push({
        type: 'unused-export',
        module: mod.id,
        message: `No exports used from ${mod.id} — possible dead code`,
        severity: 'warning',
      });
    }
  }

  return issues;
}
