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
import { log } from './utils/logger.js';
import { AuditReport } from './audit/types.js';

function printAuditReport(report: AuditReport) {
  console.log('\n🛡️  Audit Report');

  Object.entries(report.groups).forEach(([key, group]) => {
    if (!group) return;
    const color = group.score >= 90 ? '\x1b[32m' : group.score >= 70 ? '\x1b[33m' : '\x1b[31m';
    console.log(`\n${group.name} (Score: ${color}${group.score}\x1b[0m)`);
    group.results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️ ' : '❌';
      console.log(`  ${icon} ${r.title}`);
    });
  });
}

function printProfileReport(result: any) {
  if (!result.events) return;

  const profileEvents = result.events.filter((e: any) => e.decision === 'performance');
  if (profileEvents.length === 0) return;

  console.log('\n⏱️  Build Profile');
  console.log('='.repeat(40));

  const tableData = profileEvents.map((e: any) => ({
    Stage: e.stage.toUpperCase(),
    'Duration (ms)': e.data.duration.toFixed(2),
    Description: e.reason.split(' took ')[0]
  }));

  console.table(tableData);

  const totalBuild = profileEvents.find((e: any) => e.reason.startsWith('Total Build'));
  if (totalBuild) {
    console.log(`\n🚀 Total Build Time: \x1b[32m${totalBuild.data.duration.toFixed(2)}ms\x1b[0m`);
  }

  // Plugin metrics
  if (result.pluginMetrics && result.pluginMetrics.length > 0) {
    console.log('\n🔌 Plugin Performance (Top 5 Slowest)');
    const pluginTable = result.pluginMetrics.slice(0, 5).map((m: any) => ({
      Plugin: m.plugin,
      'Total Time (ms)': m.totalTimeMs.toFixed(2),
      'Avg Time (ms)': m.avgTimeMs.toFixed(2),
      Calls: m.callCount
    }));
    console.table(pluginTable);
  }
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .command(
      'dev',
      'Start development server',
      (yargs: any) => {
        return yargs
          .option('port', {
            type: 'number',
            description: 'Server port'
          })
          .option('quiet', {
            type: 'boolean',
            description: 'Suppress non-error output',
            default: false
          })
          .option('verbose', {
            type: 'boolean',
            description: 'Show detailed debug output',
            default: false
          });
      },
      async (args: any) => {
        try {
          // Set environment variables for logger
          if (args.quiet) {
            process.env.NEXXO_QUIET = 'true';
          }
          if (args.verbose) {
            process.env.DEBUG = '*';
          }

          const cfg = await loadConfig((globalThis as any).process.cwd());
          // CLI override > Config > Default
          cfg.port = args.port || cfg.port || 5173;
          await startDevServer(cfg);

          // Run initial audit on dev start (Background only)
          /*
          const { AuditEngine } = await import('./audit/index.js');
          const report = await AuditEngine.runAll(`http://localhost:${cfg.port || 5173}`);
          printAuditReport(report);
          */
          if (!args.quiet) {
            console.log('\n💡  Tip: Run `npx nexxo audit --url http://localhost:' + (cfg.port || 5173) + '` to generate an audit report.');
          }
        } catch (e: any) {
          log.error(e.message);
          process.exit(1);
        }
      }
    )
    .command(
      'build',
      'Build for production',
      (yargs: any) => {
        return yargs.option('prod', {
          type: 'boolean',
          description: 'Force production mode',
          default: false
        }).option('profile', {
          type: 'boolean',
          description: 'Show detailed build profile',
          default: false
        });
      },
      async (args: any) => {
        const { Telemetry } = await import('./ai/telemetry.js');
        const { wrapError, printHeroError } = await import('./core/errors/hero-errors.js');

        const telemetry = new Telemetry(process.cwd());
        await telemetry.init();
        telemetry.start();

        try {
          const config = await loadConfig(process.cwd());
          if (args.prod) {
            config.mode = 'production';
          }
          const result = await build(config);

          if (args.profile) {
            printProfileReport(result);
          }

          console.log('\n💡  Tip: Run `npx nexxo audit` to generate a full audit report.');

          await telemetry.stop(true);
        } catch (e: any) {
          // Convert to Hero Error
          const heroError = wrapError(e);

          // Print formatted error with context
          printHeroError(heroError);

          await telemetry.stop(false, {}, [heroError.message]);

          // AI Self-Healing capability
          /*
          const { HealerCLI } = await import('./ai/healer/cli.js');
          await HealerCLI.handle(e);
          */

          process.exit(1);
        }
      }
    )
    .command(
      'analyze',
      'Analyze bundle composition and module sizes',
      (yargs: any) => {
        return yargs.option('json', {
          type: 'boolean',
          description: 'Output as JSON instead of HTML report',
          default: false
        });
      },
      async (args: any) => {
        const { loadConfig } = await import('./config/index.js');
        const { build } = await import('./build/bundler.js');
        const { generateAnalyzeReport } = await import('./commands/analyze.js');

        try {
          const config = await loadConfig(process.cwd());
          // Run a build first to get the results
          console.log('🔄 Gathering build metadata for analysis...');
          const result = await build(config);

          await generateAnalyzeReport(result, args.json);
        } catch (e: any) {
          log.error(`Analysis failed: ${e.message}`);
          process.exit(1);
        }
      }
    )
    .command(
      'ssr',
      'Start SSR server for meta-frameworks',
      (yargs: any) => {
        return yargs
          .option('port', {
            type: 'number',
            description: 'Server port',
            default: 3000
          })
          .option('framework', {
            type: 'string',
            description: 'Framework type (nextjs|nuxt|remix)',
            default: 'nextjs'
          })
          .option('prod', {
            type: 'boolean',
            description: 'Production mode',
            default: false
          });
      },
      async (args: any) => {
        const { handleSSRCommand } = await import('./commands/ssr.js');
        await handleSSRCommand(args);
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
      'bootstrap',
      'Create a new project from a template',
      (yargs: any) => {
        return yargs
          .option('template', {
            type: 'string',
            description: 'Template to use (react, vanilla)',
            default: 'react'
          })
          .option('name', {
            type: 'string',
            description: 'Project name',
            demandOption: true
          });
      },
      async (args: any) => {
        const { bootstrapProject } = await import('./init/bootstrap.js');
        const targetDir = path.join(process.cwd(), args.name);
        await bootstrapProject(targetDir, args.template);
      }
    )
    .command(
      'css',
      'CSS utilities',
      (yargs: any) => {
        return yargs
          .command(
            'purge',
            'Analyze and remove unused CSS',
            () => { },
            async () => {
              const { purgeCSSCommand } = await import('./cli/css-cli.js');
              await purgeCSSCommand(process.cwd());
            }
          )
          .demandCommand(1, 'You must specify a subcommand: detect, list, add, purge, migrate');
      }
    )
    .command(
      'optimize',
      'Analyze and optimize project configuration',
      (yargs: any) => {
        return yargs.option('apply', {
          type: 'boolean',
          description: 'Automatically apply changes',
          default: false
        });
      },
      async (args: any) => {
        const { ProjectProfiler } = await import('./ai/optimizer/profiler.js');
        const { RulesEngine } = await import('./ai/optimizer/rules.js');
        const { LLMAdapter } = await import('./ai/optimizer/llm.js');
        const { DEFAULT_AI_CONFIG } = await import('./ai/config.js');
        const readline = await import('readline');

        log.info('Analyzing project...', { category: 'ai' });

        const profiler = new ProjectProfiler(process.cwd());
        const profile = await profiler.profile();

        // Static Rules
        let suggestions = RulesEngine.analyze(profile);

        // LLM Refinement
        const llm = new LLMAdapter(DEFAULT_AI_CONFIG);
        suggestions = await llm.refine(profile, suggestions);

        if (suggestions.length === 0) {
          log.success('No optimizations found. Your config looks great!', { category: 'ai' });
          return;
        }

        console.log('\n🚀 AI Optimization Suggestions:');
        suggestions.forEach((s, i) => {
          const color = s.impact === 'HIGH' ? '\x1b[32m' : s.impact === 'MEDIUM' ? '\x1b[33m' : '\x1b[36m';
          const reset = '\x1b[0m';
          console.log(`${i + 1}. [${color}${s.impact}${reset}] ${s.title}`);
          console.log(`   ${s.description}`);
          if (s.configPatch) {
            console.log(`   Patch: ${s.configPatch}`);
          }
        });

        if (args.apply) {
          // TODO: Apply all low risk
          log.warn('Automatic application not yet implemented.', { category: 'ai' });
        } else {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

          rl.question('\nSelect suggestions to apply [1-3, a=all, q=quit]: ', (answer) => {
            if (answer.toLowerCase() === 'q') {
              rl.close();
              return;
            }
            // TODO: Implement application logic
            log.info(`You selected: ${answer}. Application logic coming soon.`, { category: 'ai' });
            rl.close();
          });
        }
      }
    )
    .command(
      'inspect',
      'Inspect the dependency graph',
      (yargs: any) => {
        return yargs.option('filter', {
          alias: 'f',
          type: 'string',
          description: 'Filter modules by path/ID'
        });
      },
      async (args: any) => {
        const { inspectProject } = await import('./cli/inspect.js');
        await inspectProject(args.filter);
      }
    )
    .command(
      'report',
      'Generate a build report from the latest session',
      () => { },
      async () => {
        const { Telemetry } = await import('./ai/telemetry.js');
        const { ReportAssembler } = await import('./ai/reporter/assembler.js');
        const { LLMNarrator } = await import('./ai/reporter/narrator.js');
        const { DEFAULT_AI_CONFIG } = await import('./ai/config.js');
        const { AuditEngine } = await import('./audit/index.js');

        const session = await Telemetry.getLatestSession(process.cwd());
        if (!session) {
          log.error('No build history found.', { category: 'ai' });
          return;
        }

        const trends = await Telemetry.getTrends(process.cwd(), session);
        // Optional: Run audits if requested or just use stored ones (if we stored them)
        // For now, let's run fresh audits for the report
        const audits = await AuditEngine.runAll(process.cwd());

        const fullReport = ReportAssembler.assemble(session, trends, audits);
        const narrator = new LLMNarrator(DEFAULT_AI_CONFIG);
        const summary = await narrator.narrate(fullReport);

        console.log('\n📊 Build Report');
        console.log(summary);
      }
    )
    .command(
      'audit',
      'Run comprehensive audits (Accessibility, Performance, SEO)',
      (yargs: any) => {
        return yargs.option('url', {
          type: 'string',
          description: 'URL to audit'
        });
      },
      async (args: any) => {
        const { AuditEngine } = await import('./audit/index.js');
        const target = args.url || process.cwd();

        log.info(`Auditing ${target}...`, { category: 'audit' });
        const report = await AuditEngine.runAll(target);
        printAuditReport(report);
      }
    )
    .command(
      'verify',
      'Verify project health and configuration',
      (yargs: any) => {
        return yargs
          .option('ci', {
            type: 'boolean',
            description: 'CI mode (exit 1 on failure)',
            default: false
          })
          .option('strict', {
            type: 'boolean',
            description: 'Strict mode (warnings = failures)',
            default: false
          })
          .option('explain', {
            type: 'boolean',
            description: 'Show detailed explanations',
            default: false
          })
          .option('fix', {
            type: 'boolean',
            description: 'Auto-fix issues where possible',
            default: false
          });
      },
      async (args: any) => {
        const { verify } = await import('./commands/verify.js');
        await verify({
          ci: args.ci,
          strict: args.strict,
          explain: args.explain,
          fix: args.fix
        });
      }
    )
    /*
    .command(
      'ai',
      'AI-Powered Superpowers',
      (yargs: any) => {
        return yargs
          .command(
            'init',
            'Initialize AI features',
            () => { },
            async () => {
              const { AIClient } = await import('./ai/client.js');
              const { Telemetry } = await import('./ai/telemetry.js');
  
              log.info('Initializing AI features...', { category: 'ai' });
  
              const root = process.cwd();
              const client = new AIClient({ provider: 'local' }, root);
              await client.init();
  
              const telemetry = new Telemetry(root);
              await telemetry.init();
  
              log.success('AI features initialized! Local telemetry enabled.', { category: 'ai' });
            }
          )
          .command(
            'fix',
            'Auto-fix the last build error',
            () => { },
            async () => {
              const { Telemetry } = await import('./ai/telemetry.js');
              const { ErrorMemory } = await import('./ai/core/errorMemory.js');
              const { FixStore } = await import('./ai/local/fixStore.js');
              const { FixApplier } = await import('./ai/healer/applier.js');
              const { FixGenerator } = await import('./ai/healer/fixer.js');
              const { ErrorParser } = await import('./ai/healer/parser.js');
              const readline = await import('readline');
  
              const session = await Telemetry.getLatestSession(process.cwd());
              if (!session || !session.errors || session.errors.length === 0) {
                log.info('No recent errors found to fix.', { category: 'ai' });
                return;
              }
  
              const lastError = session.errors[0];
              log.info(`Analyzing error: ${lastError.substring(0, 50)}...`, { category: 'ai' });
  
              // 1. Memory & Recall
              const learnedError = ErrorMemory.normalize(lastError, { framework: 'unknown' }); // TODO: Pass real context
              const store = new FixStore(process.cwd());
              store.saveError(learnedError); // Remember this error
  
              let fixes = store.findFixes(learnedError.id);
  
              if (fixes.length > 0) {
                log.success(`Found ${fixes.length} learned fix(es)!`, { category: 'ai' });
              } else {
                log.info('No learned fixes found. Generating new ones...', { category: 'ai' });
                // Fallback to heuristic generation
                const parsed = ErrorParser.parse(lastError);
                fixes = FixGenerator.generate(parsed);
              }
  
              if (fixes.length === 0) {
                log.warn('Could not generate any fixes.', { category: 'ai' });
                return;
              }
  
              // 2. Interactive Selection
              console.log('\n🤖 AI Fix Suggestions:');
              fixes.forEach((f, i) => {
                console.log(`${i + 1}. ${f.description} (Confidence: ${f.confidence || 'New'})`);
              });
  
              const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
              });
  
              rl.question('\nApply fix [1-N, q=quit]: ', async (answer) => {
                rl.close();
                const idx = parseInt(answer) - 1;
                if (isNaN(idx) || idx < 0 || idx >= fixes.length) return;
  
                const selectedFix = fixes[idx];
                const applier = new FixApplier(process.cwd());
  
                // 3. Apply & Learn
                const fixId = store.saveFix(learnedError.id, selectedFix); // Ensure it's in DB
                const success = await applier.apply(selectedFix, fixId);
  
                if (success) {
                  log.success('Fix applied successfully! Re-run build to verify.', { category: 'ai' });
                  // In a real loop, we would re-run build here
                } else {
                  log.error('Fix failed to apply.', { category: 'ai' });
                }
              });
            }
          )
          .command(
            'status',
            'Show AI learning status',
            () => { },
            async () => {
              const { FixStore } = await import('./ai/local/fixStore.js');
              const store = new FixStore(process.cwd());
              const stats = store.getStats();
  
              console.log('\n🧠 AI Learning Status');
              console.log(`   - Learned Errors: ${stats.errors}`);
              console.log(`   - Known Fixes:    ${stats.fixes}`);
              console.log(`   - Successful Fixes: ${stats.successfulFixes}`);
            }
          )
          .command(
            'forget',
            'Forget a specific learned pattern',
            (yargs: any) => {
              return yargs.option('id', { type: 'string', demandOption: true });
            },
            async (args: any) => {
              const { FixStore } = await import('./ai/local/fixStore.js');
              const store = new FixStore(process.cwd());
              store.deleteError(args.id);
              log.success(`Forgot pattern ${args.id}`, { category: 'ai' });
            }
          )
          .command(
            'sync-models',
            'Sync with global learning network',
            () => { },
            async () => {
              const { FixStore } = await import('./ai/local/fixStore.js');
              const { CloudAPI } = await import('./ai/cloud/api.js');
              const { ModelSync } = await import('./ai/cloud/modelSync.js');
              const { DEFAULT_AI_CONFIG } = await import('./ai/config.js');
  
              const store = new FixStore(process.cwd());
              const api = new CloudAPI(DEFAULT_AI_CONFIG);
              const sync = new ModelSync(store, api, DEFAULT_AI_CONFIG);
  
              await sync.sync();
            }
          )
          .command(
            'contribute',
            'Share your learnings with the global network',
            () => { },
            async () => {
              const { FixStore } = await import('./ai/local/fixStore.js');
              const { CloudAPI } = await import('./ai/cloud/api.js');
              const { ModelSync } = await import('./ai/cloud/modelSync.js');
              const { DEFAULT_AI_CONFIG } = await import('./ai/config.js');
  
              const store = new FixStore(process.cwd());
              const api = new CloudAPI(DEFAULT_AI_CONFIG);
              const sync = new ModelSync(store, api, DEFAULT_AI_CONFIG);
  
              await sync.contribute();
            }
          )
          .demandCommand(1, 'You must specify a subcommand: init, chat, dashboard, fix, status, forget, sync-models, contribute');
      }
    )
    */
    .demandCommand(1, 'You must specify a command')
    .help()
    .argv;
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
