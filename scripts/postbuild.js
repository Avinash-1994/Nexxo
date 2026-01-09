#!/usr/bin/env node
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true }).catch(() => { });
}

async function copyIfExists(src, dest) {
  try {
    await fs.copyFile(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  } catch { }
}

async function copyAll(patternDir, filterExt, outDir) {
  try {
    const entries = await fs.readdir(patternDir);
    await ensureDir(outDir);
    for (const e of entries) {
      if (e.endsWith(filterExt)) {
        const src = join(patternDir, e);
        const dest = join(outDir, e);
        await copyIfExists(src, dest);
      }
    }
  } catch { }
}

(async () => {
  await ensureDir(distDir);

  await copyIfExists(join(rootDir, 'nexxo_native.node'), join(distDir, 'nexxo_native.node'));
  await copyAll(join(rootDir, 'src', 'plugins'), '.mjs', join(distDir, 'plugins'));
  await copyAll(join(rootDir, 'src', 'runtime'), '.js', join(distDir, 'runtime'));

  console.log('Post-build copy complete');
})();
