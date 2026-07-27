/**
 * @lunx/plugin-env — Environment Variables, Done Right
 * Replaces: vite-plugin-env, dotenv-webpack
 * Permissions: env:read
 *
 * S1 — Load .env files in correct priority order
 * S2 — Expose NUCLIE_* and VITE_* via import.meta.env
 * S3 — Generate typed env.d.ts
 * S4 — Validate required vars with clear abort messages
 * S5 — Secret guard: blocks secret-pattern vars from bundle
 */

import fs from 'node:fs';
import path from 'node:path';

export interface EnvPluginOptions {
  /** Prefix for environment variables exposed to the client (default: 'NUCLIE_') */
  prefix?: string | string[];
  /** Required environment variables — build aborts if missing */
  required?: string[];
  /** Vars explicitly declared safe to embed in bundle (overrides secret guard) */
  safe?: string[];
  /** Path to generate TypeScript declarations (default: 'src/env.d.ts') */
  dts?: string | false;
  /** Dotenv files to load in addition to defaults */
  envFiles?: string[];
}

const NUCLIE_PERMISSIONS = {
  lunx: { permissions: ['env:read'] },
};

/** Load .env files in the correct Vite-compatible priority order */
function loadEnvFiles(projectRoot: string, mode: string): Record<string, string> {
  const files = [
    `.env`,
    `.env.local`,
    `.env.${mode}`,
    `.env.${mode}.local`,
  ];

  const env: Record<string, string> = {};

  for (const file of files) {
    const filePath = path.join(projectRoot, file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }

  return env;
}

// Secret patterns to guard (from S2.2)
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9]{36}/,
  /sk_(live|test)_[A-Za-z0-9]{24,}/,
];

function isSecret(value: string): boolean {
  return SECRET_PATTERNS.some((p) => p.test(value));
}

/** Main plugin factory */
export function env(options: EnvPluginOptions = {}) {
  const {
    prefix = ['NUCLIE_', 'VITE_'],
    required = [],
    safe = [],
    dts = 'src/env.d.ts',
    envFiles = [],
  } = options;

  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  let projectRoot = process.cwd();
  let mode = 'development';
  let envVars: Record<string, string> = {};

  return {
    name: '@lunx/plugin-env',
    enforce: 'pre' as const,

    configResolved(config: any) {
      projectRoot = config.root ?? process.cwd();
      mode = config.mode ?? 'development';

      // Load .env files
      envVars = loadEnvFiles(projectRoot, mode);

      // Load extra env files
      for (const f of envFiles) {
        const fp = path.resolve(projectRoot, f);
        if (fs.existsSync(fp)) {
          const content = fs.readFileSync(fp, 'utf8');
          for (const line of content.split('\n')) {
            const eq = line.indexOf('=');
            if (eq < 0) continue;
            const k = line.slice(0, eq).trim();
            const v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
            envVars[k] = v;
          }
        }
      }

      // Validate required vars
      const missing = required.filter((k) => !envVars[k] && !process.env[k]);
      if (missing.length > 0) {
        throw new Error(
          `[lunx:env] Missing required environment variable(s): ${missing.join(', ')}\n` +
          `  Define them in .env or .env.${mode} in your project root.`
        );
      }

      // Generate .d.ts
      if (dts) {
        const filtered = Object.keys(envVars).filter((k) =>
          prefixes.some((p) => k.startsWith(p))
        );
        const declarations = filtered
          .map((k) => `    readonly ${k}: string;`)
          .join('\n');
        const content = `/// <reference types="vite/client" />\ninterface ImportMetaEnv {\n${declarations}\n}\ninterface ImportMeta {\n  readonly env: ImportMetaEnv;\n}\n`;
        const dtsPath = path.resolve(projectRoot, dts);
        fs.mkdirSync(path.dirname(dtsPath), { recursive: true });
        fs.writeFileSync(dtsPath, content, 'utf8');
      }
    },

    transform(code: string, id: string) {
      if (!id.endsWith('.ts') && !id.endsWith('.tsx') && !id.endsWith('.js') && !id.endsWith('.jsx') && !id.endsWith('.vue') && !id.endsWith('.svelte')) return;

      // Replace import.meta.env.KEY with the actual value
      let transformed = code;
      for (const [key, value] of Object.entries(envVars)) {
        if (!prefixes.some((p) => key.startsWith(p))) continue;

        // Secret guard — block secret values from being embedded
        if (isSecret(value) && !safe.includes(key)) {
          console.warn(`[lunx:env] Blocking secret-pattern var "${key}" from bundle.`);
          continue;
        }

        const regex = new RegExp(`import\\.meta\\.env\\.${key}`, 'g');
        transformed = transformed.replace(regex, JSON.stringify(value));
      }

      if (transformed !== code) return { code: transformed, map: null };
    },
  };
}

export default env;
