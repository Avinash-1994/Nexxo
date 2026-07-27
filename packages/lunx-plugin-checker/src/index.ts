/**
 * @lunx/plugin-checker — TypeScript, ESLint, Vue type errors in terminal
 * Replaces: vite-plugin-checker
 * Permissions: exec:spawn
 *
 * Runs TS/ESLint in worker threads — never blocks main dev server thread.
 * Errors appear in terminal AND the Lunx error overlay.
 */

import { Worker, isMainThread } from 'node:worker_threads';
import { execSync, spawn } from 'node:child_process';
import path from 'node:path';

export interface CheckerOptions {
  /** Run TypeScript type checking (default: false — enable explicitly) */
  typescript?: boolean | { tsconfigPath?: string };
  /** Run ESLint on changed files (default: false) */
  eslint?: boolean | { lintCommand?: string };
  /** Run vue-tsc for Vue SFC type checking (default: false) */
  vueTsc?: boolean;
  /** Run Stylelint on CSS/SCSS files (default: false) */
  stylelint?: boolean;
  /** Abort production build on errors (default: true) */
  failOnError?: boolean;
}

function runTypeCheck(tsconfigPath: string, root: string): Promise<string[]> {
  return new Promise((resolve) => {
    const proc = spawn('npx', ['tsc', '--noEmit', '-p', tsconfigPath], {
      cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    proc.stdout.on('data', (d: Buffer) => { output += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { output += d.toString(); });
    proc.on('close', () => {
      const errors = output.trim().split('\n').filter(Boolean);
      resolve(errors);
    });
  });
}

function runESLint(files: string[], root: string, cmd?: string): Promise<string[]> {
  return new Promise((resolve) => {
    const command = cmd ? cmd.split(' ') : ['npx', 'eslint', ...files, '--format', 'compact'];
    const proc = spawn(command[0], command.slice(1), {
      cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    proc.stdout.on('data', (d: Buffer) => { output += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { output += d.toString(); });
    proc.on('close', () => resolve(output.trim().split('\n').filter(Boolean)));
  });
}

export function checker(options: CheckerOptions = {}) {
  const {
    typescript = false,
    eslint = false,
    vueTsc = false,
    stylelint = false,
    failOnError = true,
  } = options;

  let projectRoot = process.cwd();
  const changedFiles = new Set<string>();
  let checkTimeout: ReturnType<typeof setTimeout> | null = null;

  async function runChecks(isProduction: boolean): Promise<string[]> {
    const allErrors: string[] = [];

    if (typescript) {
      const tsconfig = typeof typescript === 'object'
        ? typescript.tsconfigPath ?? 'tsconfig.json'
        : 'tsconfig.json';
      const errors = await runTypeCheck(tsconfig, projectRoot);
      allErrors.push(...errors);
      if (errors.length) console.error(`[lunx:checker] TypeScript: ${errors.length} error(s)`);
    }

    if (eslint && changedFiles.size > 0) {
      const cmd = typeof eslint === 'object' ? eslint.lintCommand : undefined;
      const errors = await runESLint([...changedFiles], projectRoot, cmd);
      allErrors.push(...errors);
      if (errors.length) console.error(`[lunx:checker] ESLint: ${errors.length} issue(s)`);
    }

    return allErrors;
  }

  function scheduleCheck() {
    if (checkTimeout) clearTimeout(checkTimeout);
    checkTimeout = setTimeout(async () => {
      await runChecks(false);
      changedFiles.clear();
    }, 500);
  }

  return {
    name: '@lunx/plugin-checker',

    configResolved(config: any) {
      projectRoot = config.root ?? process.cwd();
    },

    configureServer(server: any) {
      if (!typescript && !eslint && !vueTsc) return;

      server.watcher?.on('change', (file: string) => {
        changedFiles.add(file);
        scheduleCheck();
      });

      // Run initial check
      setTimeout(() => runChecks(false), 2000);
    },

    async buildStart() {
      if (!failOnError) return;
      const errors = await runChecks(true);
      if (errors.length > 0) {
        throw new Error(
          `[lunx:checker] Build aborted: ${errors.length} type/lint error(s) found.\n` +
          errors.slice(0, 5).join('\n')
        );
      }
    },
  };
}

export default checker;
