#!/usr/bin/env node
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const nativeDir = join(rootDir, 'native');

function checkCargoAvailable() {
  return new Promise((resolve) => {
    try {
      const child = spawn('cargo', ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      child.on('exit', (code) => resolve(code === 0));
      child.on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

function runNapiBuild() {
  return new Promise((resolve) => {
    try {
      const child = spawn('npx', ['napi', 'build', '--platform', '--release', '--dts', 'index.d.ts'], {
        cwd: nativeDir,
        stdio: 'pipe',
        shell: true
      });

      // Only show output if DEBUG is set
      if (process.env.DEBUG) {
        child.stdout?.on('data', (data) => console.log(data.toString()));
        child.stderr?.on('data', (data) => console.error(data.toString()));
      }

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
    const nodeFile = entries.find((e) => e.startsWith('lunx_native') && e.endsWith('.node'));
    if (!nodeFile) return false;
    const src = join(nativeDir, nodeFile);
    const dest = join(rootDir, 'lunx_native.node');
    await fs.copyFile(src, dest);
    if (process.env.DEBUG) {
      console.log(`Copied native binary to ${dest}`);
    }
    return true;
  } catch {
    return false;
  }
}

(async () => {
  // Check if cargo is available before attempting build
  const cargoAvailable = await checkCargoAvailable();

  if (!cargoAvailable) {
    if (process.env.DEBUG) {
      console.log('Cargo not found. Skipping native build (using pre-built binary or JS fallback).');
    }
    // Try to copy pre-built binary
    await copyBuiltBinary();
    process.exit(0);
    return;
  }

  if (process.env.DEBUG) {
    console.log('Building native worker (optional)...');
  }

  const built = await runNapiBuild();

  if (!built && process.env.DEBUG) {
    console.warn('Native build failed. Using pre-built binary or JS fallback.');
  }

  const copied = await copyBuiltBinary();

  if (copied && process.env.DEBUG) {
    console.log('Native binary ready');
  }

  process.exit(0);
})();
