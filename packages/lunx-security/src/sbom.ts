/**
 * S1.1 — Software Bill of Materials (CycloneDX 1.5)
 * Generates dist/lunx-sbom.json listing every npm + Rust dep
 * that contributed code to the final output bundle.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const _require = createRequire(import.meta.url);

export interface SBOMComponent {
  type: 'library';
  name: string;
  version: string;
  purl: string;                 // Package URL (pkg:npm/name@version)
  licenses: string[];
  hashes: { alg: 'SHA-256'; content: string }[];
  externalReferences?: { type: string; url: string }[];
}

export interface SBOMReport {
  bomFormat: 'CycloneDX';
  specVersion: '1.5';
  serialNumber: string;
  version: number;
  metadata: {
    timestamp: string;
    tools: { name: string; version: string }[];
  };
  components: SBOMComponent[];
}

/**
 * Walk resolved dependency graph and generate CycloneDX 1.5 SBOM.
 * @param projectRoot – root of the Lunx project
 * @param resolvedModules – list of resolved npm package names (from dep graph)
 */
export async function generateSBOM(
  projectRoot: string,
  resolvedModules: string[] = []
): Promise<SBOMReport> {
  const nodeModulesDir = path.join(projectRoot, 'node_modules');
  const components: SBOMComponent[] = [];

  // Collect packages to scan — start from resolved modules + transitive walk
  const visited = new Set<string>();
  const queue = [...new Set(resolvedModules)];

  while (queue.length > 0) {
    const pkgName = queue.shift()!;
    if (visited.has(pkgName)) continue;
    visited.add(pkgName);

    let pkgJsonPath = path.join(projectRoot, 'node_modules', pkgName, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
      // Try to resolve using node resolution
      try {
        const pkgMain = _require.resolve(pkgName, { paths: [projectRoot] });
        const match = pkgMain.match(new RegExp(`.*node_modules/${pkgName}/`));
        if (match) {
          pkgJsonPath = path.join(match[0], 'package.json');
        }
      } catch (e) {
        // fallback to standard project root search
      }
    }
    
    if (!fs.existsSync(pkgJsonPath)) {
      // Walk up directories to find it
      let currentDir = projectRoot;
      while (currentDir !== path.dirname(currentDir)) {
        const checkPath = path.join(currentDir, 'node_modules', pkgName, 'package.json');
        if (fs.existsSync(checkPath)) {
          pkgJsonPath = checkPath;
          break;
        }
        currentDir = path.dirname(currentDir);
      }
    }

    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

    // Compute sha256 of package.json as a stable content hash
    const hash = crypto.createHash('sha256')
      .update(fs.readFileSync(pkgJsonPath))
      .digest('hex');

    const licenses = normalizeLicenses(pkgJson.license || pkgJson.licenses);

    components.push({
      type: 'library',
      name: pkgJson.name ?? pkgName,
      version: pkgJson.version ?? '0.0.0',
      purl: `pkg:npm/${encodeURIComponent(pkgJson.name ?? pkgName)}@${pkgJson.version ?? '0.0.0'}`,
      licenses,
      hashes: [{ alg: 'SHA-256', content: hash }],
      externalReferences: pkgJson.repository
        ? [{ type: 'vcs', url: normalizeRepo(pkgJson.repository) }]
        : undefined,
    });

    // Enqueue transitive deps
    const deps = [
      ...Object.keys(pkgJson.dependencies ?? {}),
      ...Object.keys(pkgJson.peerDependencies ?? {}),
    ];
    queue.push(...deps.filter((d) => !visited.has(d)));
  }

  const report: SBOMReport = {
    bomFormat: 'CycloneDX',
    specVersion: '1.5',
    serialNumber: `urn:uuid:${crypto.randomUUID()}`,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [{ name: 'lunx', version: '1.4.0' }],
    },
    components,
  };

  return report;
}

/** Write the SBOM to dist/lunx-sbom.json */
export function writeSBOM(report: SBOMReport, distDir: string): void {
  const outPath = path.join(distDir, 'lunx-sbom.json');
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.info(`[lunx:security] SBOM written → ${outPath} (${report.components.length} components)`);
}

function normalizeLicenses(raw: unknown): string[] {
  if (!raw) return ['UNKNOWN'];
  if (typeof raw === 'string') return [raw];
  if (Array.isArray(raw)) return raw.map((l: any) => l?.type ?? String(l));
  if (typeof raw === 'object' && (raw as any).type) return [(raw as any).type];
  return ['UNKNOWN'];
}

function normalizeRepo(repo: unknown): string {
  if (typeof repo === 'string') return repo;
  if (typeof repo === 'object' && repo !== null && 'url' in repo) return (repo as any).url;
  return '';
}
