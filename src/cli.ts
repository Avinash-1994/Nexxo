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
<<<<<<< HEAD
    .command(
      'plugin',
      'Manage plugins',
      (yargs: any) => {
        return yargs
          .command(
            'list',
            'List available plugins',
            () => { },
            async () => {
              const { marketplace } = await import('./plugins/index.js');
              const plugins = await marketplace.list();
              console.log('Available Plugins:');
              plugins.forEach(p => console.log(`- ${p.name}: ${p.description}`));
            }
          )
          .command(
            'install <name>',
            'Install a plugin',
            (yargs: any) => {
              return yargs.positional('name', {
                describe: 'Plugin name',
                type: 'string'
              });
            },
            async (args: any) => {
              const { marketplace } = await import('./plugins/index.js');
              if (!args.name) {
                console.error('Please specify a plugin name');
                return;
              }
              await marketplace.install(args.name);
            }
          )
          .demandCommand(1, 'You must specify a subcommand: list, install');
      },
      () => { } // Main plugin command handler (unused)
    )
    .command(
      'css',
      'Manage CSS frameworks',
      (yargs: any) => {
        return yargs
          .command(
            'detect',
            'Detect CSS frameworks in project',
            () => { },
            async () => {
              const { detectCSSCommand } = await import('./cli/css-cli.js');
              await detectCSSCommand(process.cwd());
            }
          )
          .command(
            'list',
            'List active CSS stack',
            () => { },
            async () => {
              const { listCSSCommand } = await import('./cli/css-cli.js');
              await listCSSCommand(process.cwd());
            }
          )
          .command(
            'add <framework>',
            'Add a CSS framework',
            (yargs: any) => {
              return yargs.positional('framework', {
                describe: 'Framework name (tailwind, bootstrap, bulma, material)',
                type: 'string'
              });
            },
            async (args: any) => {
              const { addCSSCommand } = await import('./cli/css-cli.js');
              await addCSSCommand(args.framework, process.cwd());
            }
          )
          .command(
            'purge',
            'Analyze and remove unused CSS',
            () => { },
            async () => {
              const { purgeCSSCommand } = await import('./cli/css-cli.js');
              await purgeCSSCommand(process.cwd());
            }
          )
          .demandCommand(1, 'You must specify a subcommand: detect, list, add, purge');
      },
      () => { } // Main CSS command handler (unused)
    )
    .command(
      'repair',
      'Auto-repair project dependencies',
      () => { },
      async () => {
        const { analyzeProject, repairDependencies } = await import('./ai/analyzer.js');
        console.log('Analyzing project...');
        const analysis = await analyzeProject(process.cwd());
        console.log('Checking for issues...');
        const fixes = await repairDependencies(process.cwd(), analysis);

        if (fixes.length === 0) {
          console.log('✅ No issues found. Project is healthy.');
        } else {
          console.log('⚠️ Found issues. Run the following commands to fix:');
          fixes.forEach(fix => console.log(`  ${fix}`));
        }
      }
    )
=======
>>>>>>> 3052d2b15cdc5341dd074210747983c1668e1d58
    .demandCommand(1, 'You must specify a command')
    .help()
    .argv;
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
