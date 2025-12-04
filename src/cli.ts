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
// Import necessary functions directly
import { loadConfig } from './config/index.js';
import { startDevServer } from './dev/devServer.js';
import { build } from './build/bundler.js';
import { initProject } from './init/index.js';

async function main() {
  const argv = yargs(hideBin(process.argv))
    .command(
      'dev',
      'Start development server',
      (yargs: any) => {
        return yargs.option('port', {
          type: 'number',
          description: 'Server port',
          default: 3000
        });
      },
      async (args: any) => {
        const cfg = await loadConfig(process.cwd());
        cfg.port = args.port;
        await startDevServer(cfg);
      }
    )
    .command(
      'build',
      'Build for production',
      () => { },
      async () => {
        const cfg = await loadConfig(process.cwd());
        await build(cfg);
      }
    )
    .command(
      'init',
      'Initialize project configuration',
      (yargs: any) => {
        return yargs.option('yes', {
          type: 'boolean',
          description: 'Use defaults',
          default: false
        });
      },
      async (args: any) => {
        await initProject(process.cwd());
      }
    )
    .command(
      'builder',
      'Launch Visual Builder UI',
      (yargs: any) => {
        return yargs.option('port', {
          type: 'number',
          description: 'Builder UI port',
          default: 3030
        }).option('no-open', {
          type: 'boolean',
          description: 'Don\'t open browser',
          default: false
        });
      },
      async (args: any) => {
        const { startBuilderServer } = await import('./builder/server.js');
        await startBuilderServer({
          port: args.port,
          root: process.cwd()
        });

        if (!args['no-open']) {
          const open = (await import('open')).default;
          await open(`http://localhost:${args.port}`);
        }
      }
    )
    .demandCommand(1, 'You must specify a command')
    .help()
    .argv;
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
