#!/usr/bin/env node
// @ts-ignore
import yargs from 'yargs';
// @ts-ignore
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extForImport(relativePath: string) {
  const absPath = path.resolve(__dirname, relativePath);
  if (fs.existsSync(absPath + '.ts')) return 'file://' + absPath + '.ts';
  if (fs.existsSync(absPath + '.js')) return 'file://' + absPath + '.js';
  return relativePath;
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .command('init', 'Initialize project config', () => { }, async (args: any) => {
      const modPath = extForImport('./init/index');
      const mod = await import(modPath);
      await mod.initProject(process.cwd());
    })
    .command('dev', 'Start dev server', () => { }, async (args: any) => {
      const cfgMod = await import(extForImport('./config/index'));
      const cfg = await cfgMod.loadConfig(process.cwd());
      const modPath = extForImport('./dev/devServer');
      const mod = await import(modPath);
      await mod.startDevServer(cfg);
    })
    .command('build', 'Create a production build', () => { }, async (args: any) => {
      const cfgMod = await import(extForImport('./config/index'));
      const cfg = await cfgMod.loadConfig(process.cwd());
      const modPath = extForImport('./build/bundler');
      const mod = await import(modPath);
      await mod.build(cfg);
    })
    .demandCommand(1)
    .help()
    .parse();
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
