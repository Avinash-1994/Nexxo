/**
 * Phase 1.15 — Zero-Config Auto-Detection
 *
 * Detects the framework of a project using:
 * 1. Package dependencies (package.json)
 * 2. Entry script patterns (main.ts/main.jsx etc.)
 * 3. Monorepo manifest (pnpm-workspace.yaml, lerna.json)
 * 4. TypeScript config (tsconfig paths, compilerOptions)
 * 5. Config files (nuxt.config, svelte.config, angular.json)
 */

import fs from 'fs';
import path from 'path';

export type DetectedFramework =
  | 'react'
  | 'vue'
  | 'svelte'
  | 'angular'
  | 'sveltekit'
  | 'nuxt'
  | 'solid'
  | 'preact'
  | 'qwik'
  | 'unknown';

export interface DetectionResult {
  framework: DetectedFramework;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  entryPoint: string | null;
  entryPointReason: string;
  isMonorepo: boolean;
  isTypeScript: boolean;
  isTypeScriptReason: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJSON(filePath: string): Record<string, any> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export interface EntryPointResult {
  path: string | null;
  reason: string;
}

function findEntryPoint(root: string): EntryPointResult {
  const rules: Array<{ file: string; reason: string }> = [
    { file: 'index.html',      reason: 'Rule 1: index.html in project root' },
    { file: 'src/main.ts',    reason: 'Rule 2: src/main.ts exists' },
    { file: 'src/main.tsx',   reason: 'Rule 2: src/main.tsx exists' },
    { file: 'src/main.js',    reason: 'Rule 3: src/main.js exists' },
    { file: 'src/index.ts',   reason: 'Rule 4: src/index.ts exists' },
    { file: 'src/index.js',   reason: 'Rule 5: src/index.js exists' },
  ];
  for (const rule of rules) {
    if (fileExists(path.join(root, rule.file))) {
      return { path: rule.file, reason: rule.reason };
    }
  }
  return { path: null, reason: 'No matching entry file found' };
}

function isMonorepo(root: string): boolean {
  return (
    fileExists(path.join(root, 'pnpm-workspace.yaml')) ||
    fileExists(path.join(root, 'lerna.json')) ||
    fileExists(path.join(root, 'nx.json')) ||
    fileExists(path.join(root, 'turbo.json')) ||
    (() => {
      const pkg = readJSON(path.join(root, 'package.json'));
      return Array.isArray(pkg?.workspaces);
    })()
  );
}

function isTypeScript(root: string): boolean {
  return fileExists(path.join(root, 'tsconfig.json'));
}

// ─── Framework detection rules ───────────────────────────────────────────────

interface Rule {
  framework: DetectedFramework;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  test: (root: string, deps: Record<string, string>) => boolean;
}

const RULES: Rule[] = [
  // Config-file detection (highest confidence)
  {
    framework: 'nuxt',
    confidence: 'high',
    reason: 'nuxt.config.ts/js found',
    test: (root) =>
      fileExists(path.join(root, 'nuxt.config.ts')) ||
      fileExists(path.join(root, 'nuxt.config.js')),
  },
  {
    framework: 'sveltekit',
    confidence: 'high',
    reason: 'svelte.config.js with @sveltejs/kit dependency found',
    test: (root, deps) =>
      (fileExists(path.join(root, 'svelte.config.js')) ||
        fileExists(path.join(root, 'svelte.config.ts'))) &&
      ('@sveltejs/kit' in deps),
  },
  {
    framework: 'angular',
    confidence: 'high',
    reason: 'angular.json found',
    test: (root) => fileExists(path.join(root, 'angular.json')),
  },

  // Dependency-based detection
  {
    framework: 'nuxt',
    confidence: 'high',
    reason: 'nuxt package in dependencies',
    test: (_, deps) => 'nuxt' in deps || 'nuxt3' in deps,
  },
  {
    framework: 'sveltekit',
    confidence: 'high',
    reason: '@sveltejs/kit in dependencies',
    test: (_, deps) => '@sveltejs/kit' in deps,
  },
  {
    framework: 'angular',
    confidence: 'high',
    reason: '@angular/core in dependencies',
    test: (_, deps) => '@angular/core' in deps,
  },
  {
    framework: 'svelte',
    confidence: 'high',
    reason: 'svelte in dependencies',
    test: (_, deps) => 'svelte' in deps && !('@sveltejs/kit' in deps),
  },
  {
    framework: 'vue',
    confidence: 'high',
    reason: 'vue in dependencies',
    test: (_, deps) => 'vue' in deps && !('nuxt' in deps) && !('nuxt3' in deps),
  },
  {
    framework: 'solid',
    confidence: 'high',
    reason: 'solid-js in dependencies',
    test: (_, deps) => 'solid-js' in deps,
  },
  {
    framework: 'qwik',
    confidence: 'high',
    reason: '@builder.io/qwik in dependencies',
    test: (_, deps) => '@builder.io/qwik' in deps,
  },
  {
    framework: 'preact',
    confidence: 'high',
    reason: 'preact in dependencies',
    test: (_, deps) => 'preact' in deps,
  },
  {
    framework: 'react',
    confidence: 'high',
    reason: 'react in dependencies',
    test: (_, deps) => 'react' in deps,
  },

  // Entry-file heuristics (medium confidence)
  {
    framework: 'vue',
    confidence: 'medium',
    reason: 'App.vue found in src/',
    test: (root) =>
      fileExists(path.join(root, 'src', 'App.vue')) ||
      fileExists(path.join(root, 'App.vue')),
  },
  {
    framework: 'svelte',
    confidence: 'medium',
    reason: 'App.svelte found in src/',
    test: (root) =>
      fileExists(path.join(root, 'src', 'App.svelte')) ||
      fileExists(path.join(root, 'App.svelte')),
  },
  {
    framework: 'react',
    confidence: 'medium',
    reason: 'App.tsx/jsx found in src/',
    test: (root) =>
      fileExists(path.join(root, 'src', 'App.tsx')) ||
      fileExists(path.join(root, 'src', 'App.jsx')),
  },
];

// ─── Main export ─────────────────────────────────────────────────────────────

export function detectFramework(root: string): DetectionResult {
  const pkgPath = path.join(root, 'package.json');
  const pkg = readJSON(pkgPath) || {};
  const deps: Record<string, string> = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
    ...(pkg.peerDependencies || {}),
  };

  const entryResult = findEntryPoint(root);

  for (const rule of RULES) {
    if (rule.test(root, deps)) {
      // Angular always requires TypeScript
      const angularImpliesTS = rule.framework === 'angular';
      const hasTS = isTypeScript(root) || angularImpliesTS;
      const tsReason = angularImpliesTS
        ? '@angular/core implies TypeScript'
        : (hasTS ? 'tsconfig.json found' : 'no tsconfig.json');

      return {
        framework: rule.framework,
        confidence: rule.confidence,
        reason: rule.reason,
        entryPoint: entryResult.path,
        entryPointReason: entryResult.reason,
        isMonorepo: isMonorepo(root),
        isTypeScript: hasTS,
        isTypeScriptReason: tsReason,
      };
    }
  }

  return {
    framework: 'unknown',
    confidence: 'low',
    reason: 'No recognizable framework signals found',
    entryPoint: entryResult.path,
    entryPointReason: entryResult.reason,
    isMonorepo: isMonorepo(root),
    isTypeScript: isTypeScript(root),
    isTypeScriptReason: isTypeScript(root) ? 'tsconfig.json found' : 'no tsconfig.json',
  };
}
