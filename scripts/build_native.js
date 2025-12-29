#!/usr/bin/env node
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const nativeDir = join(rootDir, 'src', 'native');

function runNapiBuild() {
  return new Promise((resolve) => {
    try {
      const child = spawn('npx', ['napi', 'build', '--platform', '--release', '--dts', 'index.d.ts'], {
        cwd: nativeDir,
        stdio: 'inherit',
        shell: true
      });
      child.on('exit', (code) => resolve(code === 0));
      child.on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

async function copyBuiltBinary() {
  try {
    const entries = await fs.readdir(nativeDir);
    const nodeFile = entries.find((e) => e.endsWith('.node'));
    if (!nodeFile) return false;
    const src = join(nativeDir, nodeFile);
    const dest = join(rootDir, 'urja_native.node');
    await fs.copyFile(src, dest);
    console.log(`Copied native binary to ${dest}`);
    return true;
  } catch {
    return false;
  }
}

(async () => {
  console.log('Building native worker (optional)...');
  const built = await runNapiBuild();
  if (!built) {
    console.warn('Native build skipped or failed. JS fallback will be used.');
  }
  const copied = await copyBuiltBinary();
  if (!copied) {
    console.warn('Native binary not found. Proceeding without it.');
  }
  process.exit(0);
})();

