import path from 'path';
import fs from 'fs';
import os from 'os';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// NEW-02: lunx info — environment info for bug reports

function detectPackageManager(cwd: string): string {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock')))       return 'yarn';
  if (fs.existsSync(path.join(cwd, 'bun.lockb')))       return 'bun';
  return 'npm';
}

export async function runInfo() {
  const pkgPath = path.join(__dirname, '../../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const cwd = process.cwd();

  const nodeVersion = process.version;
  const platform = `${process.platform} ${os.arch()}`;
  const pm = detectPackageManager(cwd);

  let framework = 'none';
  try {
    const { loadConfig } = await import('../config/index.js');
    const config = await loadConfig(cwd);
    framework = config.framework ?? 'auto-detect';
  } catch {}

  const cacheDb = path.join(cwd, '.lunx/cache/cache.db');
  let cacheSize = 'not found';
  try {
    const stat = fs.statSync(cacheDb);
    cacheSize = `${(stat.size / 1024 / 1024).toFixed(1)}MB`;
  } catch {}

  console.log(`
  Lunx:           ${pkg.version}
  Node.js:         ${nodeVersion}
  OS:              ${platform}
  Package manager: ${pm}
  Framework:       ${framework}
  lunx_native:    ${pkg.version} (rust-notify)
  Cache:           .lunx/cache/cache.db (${cacheSize})

  Copy this when filing a bug report:
  https://github.com/Avinash-1994/lunx/issues/new
  `);
}
