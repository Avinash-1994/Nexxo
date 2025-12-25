import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

import { z } from 'zod';
import { log } from '../utils/logger.js';
import { spaPreset, ssrPreset, ssgPreset } from '../presets/index.js';

export type BuildMode = 'development' | 'production' | 'test';

const BuildConfigSchema = z.object({
  root: z.string().optional(),
  entry: z.array(z.string()).default(['src/main.tsx']),
  mode: z.enum(['development', 'production', 'test']).default('development'),
  outDir: z.string().default('build_output'),
  port: z.number().default(5173),
  plugins: z.array(z.any()).optional(),
  esbuildPlugins: z.array(z.any()).optional(),
  platform: z.enum(['browser', 'node', 'edge']).default('browser'),
  preset: z.enum(['spa', 'ssr', 'ssg']).default('spa'),
  federation: z.object({
    name: z.string(),
    filename: z.string().optional(),
    exposes: z.record(z.string(), z.string()).optional(),
    remotes: z.record(z.string(), z.string()).optional(),
    shared: z.record(z.string(), z.object({
      singleton: z.boolean().optional(),
      requiredVersion: z.string().optional(),
    })).optional(),
    prefetch: z.array(z.string()).optional(),
    fallback: z.string().optional(),
    mock: z.boolean().optional(),
    healthCheck: z.string().optional(),
  }).optional(),
  css: z.object({
    framework: z.enum(['tailwind', 'bootstrap', 'bulma', 'material', 'none']).optional(),
    purge: z.boolean().optional(),
    critical: z.boolean().optional(),
  }).optional(),
  build: z.object({
    minify: z.boolean().optional(),
    sourcemap: z.enum(['inline', 'external', 'hidden', 'none']).optional(),
    splitting: z.boolean().optional(),
    targets: z.array(z.string()).optional(),
    manualChunks: z.record(z.string(), z.array(z.string())).optional(),
  }).optional(),
  server: z.object({
    host: z.string().optional(),
    port: z.number().optional(),
    strictPort: z.boolean().optional(),
    cors: z.boolean().optional(),
    open: z.union([z.boolean(), z.string()]).optional(),
    proxy: z.record(z.string(), z.union([z.string(), z.any()])).optional(),
    https: z.union([z.boolean(), z.object({ key: z.string(), cert: z.string() })]).optional(),
    headers: z.record(z.string(), z.string()).optional(),
  }).optional(),
  prebundle: z.object({
    enabled: z.boolean().default(true),
    include: z.array(z.string()).optional(),
    exclude: z.array(z.string()).optional(),
  }).optional(),
});

export type BuildConfig = {
  root: string;
  entry: string[];
  mode: 'development' | 'production' | 'test';
  outDir: string;
  port: number;
  plugins?: any[];
  esbuildPlugins?: any[];
  platform: 'browser' | 'node' | 'edge';
  preset: 'spa' | 'ssr' | 'ssg';
  federation?: {
    name: string;
    filename?: string;
    exposes?: Record<string, string>;
    remotes?: Record<string, string>;
    shared?: Record<string, { singleton?: boolean; requiredVersion?: string }>;
    prefetch?: string[];
    fallback?: string;
    mock?: boolean;
    healthCheck?: string;
  };
  css?: {
    framework?: 'tailwind' | 'bootstrap' | 'bulma' | 'material' | 'none';
    purge?: boolean;
    critical?: boolean;
  };
  build?: {
    minify?: boolean;
    sourcemap?: 'inline' | 'external' | 'hidden' | 'none';
    splitting?: boolean;
    targets?: string[];
    manualChunks?: Record<string, string[]>;
  };
  server?: {
    host?: string;
    port?: number;
    strictPort?: boolean;
    cors?: boolean | any;
    open?: boolean | string;
    proxy?: Record<string, string | any>;
    https?: boolean | { key: string; cert: string };
    headers?: Record<string, string>;
  };
  prebundle?: {
    enabled?: boolean;
    include?: string[];
    exclude?: string[];
  };
};

export async function loadConfig(cwd: string): Promise<BuildConfig> {
  const jsonPath = path.join(cwd, 'nextgen.build.json');
  const urjaJsonPath = path.join(cwd, 'urja.config.json');
  const yamlPath = path.join(cwd, 'nextgen.build.yaml');
  const ymlPath = path.join(cwd, 'nextgen.build.yml');
  const tsPath = path.join(cwd, 'nextgen.build.ts');

  let rawConfig: any;

  try {
    if (await fs.access(jsonPath).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(jsonPath, 'utf-8');
      rawConfig = JSON.parse(raw);
    } else if (await fs.access(urjaJsonPath).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(urjaJsonPath, 'utf-8');
      rawConfig = JSON.parse(raw);
    } else if (await fs.access(yamlPath).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(yamlPath, 'utf-8');
      rawConfig = yaml.load(raw);
    } else if (await fs.access(ymlPath).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(ymlPath, 'utf-8');
      rawConfig = yaml.load(raw);
    } else if (await fs.access(tsPath).then(() => true).catch(() => false)) {
      log.info('Loading TypeScript config...');
      const { build } = await import('esbuild');
      const outfile = path.join(cwd, 'nextgen.build.temp.mjs');

      await build({
        entryPoints: [tsPath],
        outfile,
        bundle: true,
        platform: 'node',
        format: 'esm',
        target: 'es2020',
        external: [
          'esbuild', 'zod', 'kleur',
          'svelte-preprocess', 'svelte', 'esbuild-svelte', 'js-yaml',
          // svelte-preprocess optional deps
          'coffeescript', 'pug', 'stylus', 'less', 'postcss', 'sass', 'postcss-load-config', 'sugarss'
        ] // exclude deps
      });

      try {
        const mod = await import(outfile);
        rawConfig = mod.default || mod;
      } finally {
        await fs.unlink(outfile).catch(() => { });
      }
    } else {
      // Return default config if file not found, with auto-detection
      log.info('No config file found, using defaults...');

      // Auto-detect entry point
      const entryCandidates = [
        'src/main.tsx',
        'src/main.ts',
        'src/main.jsx',
        'src/main.js',
        'src/index.tsx',
        'src/index.ts',
        'src/index.jsx',
        'src/index.js'
      ];

      let detectedEntry = ['src/main.tsx']; // Default fallback
      for (const candidate of entryCandidates) {
        if (await fs.access(path.join(cwd, candidate)).then(() => true).catch(() => false)) {
          detectedEntry = [candidate];
          break;
        }
      }

      return {
        root: cwd,
        entry: detectedEntry,
        mode: 'development',
        outDir: 'build_output',
        port: 5173,
        platform: 'browser',
        preset: 'spa',
      };
    }

    const result = BuildConfigSchema.safeParse(rawConfig);

    if (!result.success) {
      log.error('Invalid config file:', result.error.format());
      process.exit(1);
    }

    const config = result.data;
    // Ensure root is set
    const root = config.root || cwd;

    let finalConfig = { ...config };
    if (config.preset === 'spa') finalConfig = { ...finalConfig, ...(spaPreset.apply(finalConfig) as any) };
    if (config.preset === 'ssr') finalConfig = { ...finalConfig, ...(ssrPreset.apply(finalConfig) as any) };
    if (config.preset === 'ssg') finalConfig = { ...finalConfig, ...(ssgPreset.apply(finalConfig) as any) };

    return {
      ...finalConfig,
      root,
    } as BuildConfig;

  } catch (e: any) {
    log.error('Failed to load config:', e.message);
    process.exit(1);
  }
}

/**
 * Save configuration to file
 */
export async function saveConfig(cwd: string, config: any): Promise<void> {
  const jsonPath = path.join(cwd, 'nextgen.build.json');
  await fs.writeFile(jsonPath, JSON.stringify(config, null, 2), 'utf-8');
  log.info(`Configuration saved to ${jsonPath}`);
}

/**
 * Helper for TypeScript config files
 */
export function defineConfig(config: Partial<BuildConfig>): Partial<BuildConfig> {
  return config;
}
