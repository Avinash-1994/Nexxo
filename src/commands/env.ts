import path from 'path';
import fs from 'fs';

// NEW-03: lunx env — validate environment variables

function scanForEnvUsage(srcDir: string): Set<string> {
  const used = new Set<string>();
  if (!fs.existsSync(srcDir)) return used;

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(full);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx|svelte|vue)$/.test(entry.name)) {
        const content = fs.readFileSync(full, 'utf8');
        const matches = content.matchAll(/import\.meta\.env\.(LUNX_[A-Z0-9_]+)/g);
        for (const m of matches) used.add(m[1]);
      }
    }
  }
  walk(srcDir);
  return used;
}

export async function runEnv() {
  const cwd = process.cwd();
  let mode = 'development';
  try {
    const { loadConfig } = await import('../config/index.js');
    const config = await loadConfig(cwd);
    mode = config.mode ?? 'development';
  } catch {}

  const envFiles = [
    `.env.${mode}.local`,
    `.env.${mode}`,
    '.env.local',
    '.env',
  ].filter(f => fs.existsSync(path.join(cwd, f)));

  const envVars: Record<string, string> = {};
  for (const file of envFiles) {
    const content = fs.readFileSync(path.join(cwd, file), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=][^=]*)=(.*)$/);
      if (match) envVars[match[1].trim()] = match[2].trim();
    }
  }

  const usedVars = scanForEnvUsage(path.join(cwd, 'src'));

  console.log(`\n  Environment: ${mode}`);
  if (envFiles.length > 0) console.log(`  Source: ${envFiles[0]}`);
  console.log();

  const lunxVars = Object.entries(envVars).filter(([k]) => k.startsWith('LUNX_'));
  for (const [key] of lunxVars) {
    const used = usedVars.has(key);
    console.log(`  ✓ ${key.padEnd(30)} = [set]${used ? '' : ' (unused in code)'}`);
  }

  for (const key of usedVars) {
    if (!envVars[key]) {
      console.log(`  ✗ ${key.padEnd(30)} = [not set] — referenced in code`);
    }
  }

  const nonLunx = Object.keys(envVars).filter(k => !k.startsWith('LUNX_') && !k.startsWith('#'));
  for (const key of nonLunx) {
    console.log(`  ⚠  ${key.padEnd(30)} — missing LUNX_ prefix, not exposed to browser`);
  }

  if (lunxVars.length === 0 && usedVars.size === 0) {
    console.log('  No LUNX_ environment variables found.');
    console.log('  Docs: https://lunx.dev/guide/env-vars');
  }
  console.log();
}
