import esbuild from 'esbuild';
import path from 'path';
import { BuildConfig } from '../config/index.js';
import { log } from '../utils/logger.js';
import { DiskCache } from '../cache/index.js';
import fs from 'fs/promises';

import { createEsbuildPlugin } from '../plugins/esbuildAdapter.js';
import { PluginManager } from '../plugins/index.js';

export async function build(cfg: BuildConfig) {
  log.info('Starting build', cfg.mode);

  const pluginManager = new PluginManager();
  if (cfg.plugins) {
    cfg.plugins.forEach(p => pluginManager.register(p));
  }

  const entryPoints: Record<string, string> = {};
  cfg.entry.forEach((e: string, i: number) => (entryPoints['entry' + i] = path.resolve(cfg.root, e)));

  const cache = new DiskCache(cfg.root);
  await cache.ensure();
  const key = await cache.keyFromFiles(Object.values(entryPoints));
  if (await cache.has(key)) {
    const entry = await cache.get(key);
    log.info('Cache hit, restoring build from cache:', key);
    const restored = await cache.restoreFiles(key, path.resolve(cfg.root, cfg.outDir));
    if (restored) {
      log.info('Restored cached files to', cfg.outDir);
      return;
    } else {
      log.warn('Cache entry present but failed to restore, rebuilding');
    }
  }

  await esbuild.build({
    entryPoints,
    bundle: true,
    splitting: true,
    format: 'esm',
    outdir: path.resolve(cfg.root, cfg.outDir),
    minify: cfg.mode === 'production',
    sourcemap: cfg.mode !== 'production',
    target: ['es2020'],
    loader: { '.png': 'file', '.svg': 'file', '.css': 'css' },
    metafile: true,
    logLevel: 'info',
    plugins: [createEsbuildPlugin(pluginManager)],
  });

  // write minimal cache entry: manifest of output files
  try {
    const outdir = path.resolve(cfg.root, cfg.outDir);
    const files = (await fs.readdir(outdir)).map((f) => path.join(outdir, f));
    await cache.put({ key, outDir: outdir, files, created: Date.now() });
    await cache.putFiles(key, files);
    log.info('Cached build with key', key);
  } catch (e) {
    log.warn('Failed to write cache entry', e);
  }

  log.success('Build finished');
}
