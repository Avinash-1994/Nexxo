/**
 * Phase 1.16 — Monorepo Workspace Support
 *
 * Maps cross-package deps, maintains HMR boundary awareness,
 * and produces a topological build plan for `lunx build --all`.
 */

import fs from 'fs';
import path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkspacePackage {
  name: string;
  location: string;      // absolute path
  version: string;
  dependencies: string[];  // workspace package names this package depends on
  isApp: boolean;
}

export interface BuildPlan {
  /** Topological order of package names to build */
  order: string[];
  /** Packages that can run in parallel (same topological depth) */
  parallelGroups: string[][];
  /** Cross-package HMR boundaries: {from} changes should HMR into {to} */
  hmrBoundaries: Array<{ from: string; to: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJSON(filePath: string): Record<string, any> | null {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

function glob(dir: string, pattern: RegExp): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => pattern.test(f))
    .map(f => path.join(dir, f));
}

// ─── Workspace Scanner ────────────────────────────────────────────────────────

export class LunxWorkspace {
  private root: string;
  private packages: Map<string, WorkspacePackage> = new Map();

  constructor(root: string) {
    this.root = root;
    this.scan();
  }

  private scan() {
    const pkg = readJSON(path.join(this.root, 'package.json'));
    const workspaceGlobs: string[] = pkg?.workspaces ?? [];

    // Resolve workspace globs (simple: only supports "packages/*", "apps/*" etc.)
    const searchDirs: string[] = [];
    for (const g of workspaceGlobs) {
      const base = g.replace(/\/\*$/, '');
      const full = path.join(this.root, base);
      if (fs.existsSync(full)) {
        for (const entry of fs.readdirSync(full)) {
          searchDirs.push(path.join(full, entry));
        }
      }
    }

    // If no workspaces defined, scan packages/ and apps/
    if (searchDirs.length === 0) {
      for (const dir of ['packages', 'apps']) {
        const base = path.join(this.root, dir);
        if (fs.existsSync(base)) {
          for (const entry of fs.readdirSync(base)) {
            searchDirs.push(path.join(base, entry));
          }
        }
      }
    }

    for (const dir of searchDirs) {
      const pkgPath = path.join(dir, 'package.json');
      if (!fs.existsSync(pkgPath)) continue;
      const pkg = readJSON(pkgPath);
      if (!pkg?.name) continue;

      this.packages.set(pkg.name, {
        name: pkg.name,
        location: dir,
        version: pkg.version ?? '0.0.0',
        dependencies: Object.keys({
          ...(pkg.dependencies ?? {}),
          ...(pkg.devDependencies ?? {}),
        }),
        isApp: dir.includes(`${path.sep}apps${path.sep}`),
      });
    }
  }

  get allPackages(): WorkspacePackage[] {
    return Array.from(this.packages.values());
  }

  getPackage(name: string): WorkspacePackage | undefined {
    return this.packages.get(name);
  }

  /** Returns only cross-workspace deps (filters out external npm packages) */
  private workspaceDeps(pkg: WorkspacePackage): string[] {
    return pkg.dependencies.filter(d => this.packages.has(d));
  }

  /**
   * Topological sort using Kahn's algorithm.
   * Returns order to build in (leaves first).
   */
  buildPlan(): BuildPlan {
    const pkgNames = Array.from(this.packages.keys());
    const inDegree = new Map<string, number>(pkgNames.map(n => [n, 0]));
    const dependents = new Map<string, string[]>();

    for (const pkg of this.packages.values()) {
      for (const dep of this.workspaceDeps(pkg)) {
        inDegree.set(pkg.name, (inDegree.get(pkg.name) ?? 0) + 1);
        if (!dependents.has(dep)) dependents.set(dep, []);
        dependents.get(dep)!.push(pkg.name);
      }
    }

    // Build topological order + parallel groups
    const order: string[] = [];
    const parallelGroups: string[][] = [];
    const queue = pkgNames.filter(n => (inDegree.get(n) ?? 0) === 0).sort();

    while (queue.length > 0) {
      // All items in the queue can run in parallel
      parallelGroups.push([...queue]);
      order.push(...queue);

      const next: string[] = [];
      for (const name of queue) {
        for (const dep of dependents.get(name) ?? []) {
          const deg = (inDegree.get(dep) ?? 0) - 1;
          inDegree.set(dep, deg);
          if (deg === 0) next.push(dep);
        }
      }
      queue.length = 0;
      queue.push(...next.sort());
    }

    // HMR boundaries: from every non-app to every app that depends on it (directly or transitively)
    const hmrBoundaries: Array<{ from: string; to: string }> = [];
    for (const pkg of this.packages.values()) {
      if (pkg.isApp) continue;
      for (const app of this.packages.values()) {
        if (!app.isApp) continue;
        if (this.isTransitiveDep(app, pkg.name, new Set())) {
          hmrBoundaries.push({ from: pkg.name, to: app.name });
        }
      }
    }

    return { order, parallelGroups, hmrBoundaries };
  }

  private isTransitiveDep(pkg: WorkspacePackage, target: string, visited: Set<string>): boolean {
    if (visited.has(pkg.name)) return false;
    visited.add(pkg.name);
    for (const dep of this.workspaceDeps(pkg)) {
      if (dep === target) return true;
      const depPkg = this.packages.get(dep);
      if (depPkg && this.isTransitiveDep(depPkg, target, visited)) return true;
    }
    return false;
  }
}
