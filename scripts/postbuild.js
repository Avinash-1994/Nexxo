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

  await copyAll(join(rootDir, 'src', 'plugins'), '.mjs', join(distDir, 'plugins'));
  await copyAll(join(rootDir, 'src', 'runtime'), '.js', join(distDir, 'runtime'));

  // Mirror dist/src/* → dist/* so tests using '../dist/config/index.js' resolve correctly.
  // tsc with no rootDir and include:['src/**/*'] outputs dist/src/**  but tests expect dist/**
  async function mirrorDir(srcDir, destDir) {
    try {
      const entries = await fs.readdir(srcDir, { withFileTypes: true });
      await ensureDir(destDir);
      for (const e of entries) {
        const s = join(srcDir, e.name);
        const d = join(destDir, e.name);
        if (e.isDirectory()) {
          await mirrorDir(s, d);
        } else if (e.name.endsWith('.js') || e.name.endsWith('.d.ts') || e.name.endsWith('.js.map')) {
          await copyIfExists(s, d);
        }
      }
    } catch { }
  }
  await mirrorDir(join(distDir, 'src'), distDir);

  // Ensure CLI entry points are executable when installed as a local package
  const executables = ['cli.js', 'create-lunx.js'];
  for (const file of executables) {
    const target = join(distDir, file);
    await fs.chmod(target, 0o755).catch(() => { });
  }

  await fs.rm(join(distDir, 'src'), { recursive: true, force: true }).catch(() => {});
  await fs.rm(join(distDir, 'test'), { recursive: true, force: true }).catch(() => {});
  await fs.rm(join(distDir, 'visual'), { recursive: true, force: true }).catch(() => {});
  await fs.rm(join(distDir, 'repro'), { recursive: true, force: true }).catch(() => {});
  await fs.rm(join(distDir, 'test-server.js'), { force: true }).catch(() => {});
  await fs.rm(join(distDir, 'test-server.d.ts'), { force: true }).catch(() => {});
  await fs.rm(join(distDir, 'plugins', 'testSandbox.js'), { force: true }).catch(() => {});
  await fs.rm(join(distDir, 'plugins', 'testSandbox.d.ts'), { force: true }).catch(() => {});

  console.log('Post-build copy and cleanup complete');
})();
