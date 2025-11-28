import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

import { z } from 'zod';
import { log } from '../utils/logger.js';

export type BuildMode = 'development' | 'production' | 'test';

const BuildConfigSchema = z.object({
  root: z.string().optional(),
  entry: z.array(z.string()).default(['src/main.tsx']),
  mode: z.enum(['development', 'production', 'test']).default('development'),
  outDir: z.string().default('build_output'),
  port: z.number().default(5173),
  plugins: z.array(z.any()).optional(),
  esbuildPlugins: z.array(z.any()).optional(),
});

export type BuildConfig = {
  root: string;
  entry: string[];
  mode: 'development' | 'production' | 'test';
  outDir: string;
  port: number;
  plugins?: any[];
  esbuildPlugins?: any[];
};

export async function loadConfig(cwd: string): Promise<BuildConfig> {
  const jsonPath = path.join(cwd, 'nextgen.build.json');
  const yamlPath = path.join(cwd, 'nextgen.build.yaml');
  const ymlPath = path.join(cwd, 'nextgen.build.yml');
  const tsPath = path.join(cwd, 'nextgen.build.ts');

  let rawConfig: any;

  try {
    if (await fs.access(jsonPath).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(jsonPath, 'utf-8');
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
      // Return default config if file not found
      return {
        root: cwd,
        entry: ['src/main.tsx'],
        mode: 'development',
        outDir: 'build_output',
        port: 5173,
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

    return {
      ...config,
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

