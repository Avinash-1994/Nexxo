import kleur from 'kleur';
import fs from 'fs';
import path from 'path';

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';
export type LogCategory = 'build' | 'hmr' | 'server' | 'cache' | 'audit' | 'general' | 'ai' | 'css';

export interface LogContext {
  timestamp?: boolean;
  level?: LogLevel;
  category?: LogCategory;
  file?: string;
  duration?: number;
  [key: string]: any;
}

const time = () => {
  const d = new Date();
  return kleur.gray(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`);
};

const categoryColor = (cat: LogCategory) => {
  switch (cat) {
    case 'build': return kleur.cyan('BUILD');
    case 'hmr': return kleur.magenta('HMR');
    case 'server': return kleur.blue('SERVER');
    case 'cache': return kleur.green('CACHE');
    case 'audit': return kleur.yellow('AUDIT');
    case 'css': return kleur.magenta('CSS');
    case 'ai': return kleur.yellow('AI');
    default: return kleur.gray('GEN');
  }
};

const formatDuration = (ms: number) => {
  return ms > 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
};

export const log = {
  info: (msg: string, ctx: LogContext = {}) => {
    // In quiet mode, allow essential server messages through
    if (process.env.NEXXO_QUIET === 'true' && ctx.category !== 'server') return;
    const cat = ctx.category ? `[${categoryColor(ctx.category)}]` : '';
    const dur = ctx.duration ? kleur.yellow(`+${formatDuration(ctx.duration)}`) : '';
    console.log(`${time()} ${kleur.blue('ℹ')} ${cat} ${msg} ${dur}`);
  },
  success: (msg: string, ctx: LogContext = {}) => {
    const cat = ctx.category ? `[${categoryColor(ctx.category)}]` : '';
    const dur = ctx.duration ? kleur.yellow(`+${formatDuration(ctx.duration)}`) : '';
    console.log(`${time()} ${kleur.green('✔')} ${cat} ${msg} ${dur}`);
  },
  warn: (msg: string, ctx: LogContext = {}) => {
    // In quiet mode, keep server warnings visible
    if (process.env.NEXXO_QUIET === 'true' && ctx.category !== 'server') return;
    const cat = ctx.category ? `[${categoryColor(ctx.category)}]` : '';
    console.log(`${time()} ${kleur.yellow('⚠')} ${cat} ${msg}`);
  },
  error: (msg: string, ctx: LogContext | any = {}) => {
    const cat = ctx.category ? `[${categoryColor(ctx.category)}]` : '';
    console.error(`${time()} ${kleur.red('✖')} ${cat} ${msg}`);
    if (ctx.stack) {
      console.error(kleur.dim(ctx.stack));
    }
  },
  debug: (msg: string, ctx: LogContext = {}) => {
    if (process.env.DEBUG && process.env.NEXXO_QUIET !== 'true') {
      const cat = ctx.category ? `[${categoryColor(ctx.category)}]` : '';
      console.log(`${time()} ${kleur.magenta('⚙')} ${cat} ${msg}`);
    }
  },
  projectError: (error: { file?: string; message: string; line?: number; column?: number; type?: string }) => {
    console.error('');
    console.error(`${time()} ${kleur.cyan('[nexxo]')} ${kleur.red(error.type || 'Error')}: ${error.message}`);
    if (error.file) {
      console.error(kleur.dim(`- ${error.file}:${error.line || 1}:${error.column || 1}`));
    }

    // Try to show a small code snippet around the error line
    try {
      if (error.file && error.line) {
        let fp = error.file;
        if (!path.isAbsolute(fp)) fp = path.resolve(process.cwd(), fp);
        if (fs.existsSync(fp)) {
          console.error('');
          const content = fs.readFileSync(fp, 'utf-8');
          const lines = content.split(/\r?\n/);
          const idx = Math.max(0, (error.line || 1) - 1);
          const start = Math.max(0, idx - 2);
          const end = Math.min(lines.length - 1, idx + 2);

          for (let i = start; i <= end; i++) {
            const num = String(i + 1).padStart(String(end + 1).length + 1, ' ');
            const isErrorLine = i === idx;
            const lineText = lines[i] ?? '';

            // Format:  32 | const filterData = ...
            console.error(`${kleur.dim(num)} ${kleur.dim('|')} ${lineText}`);

            if (isErrorLine) {
              // Add caret pointing to error
              const indent = num.length + 3 + (error.column ? error.column - 1 : 0);
              // Limit caret length to avoid wrapping mess if column is huge
              console.error(' '.repeat(indent) + kleur.red('^'));
            }
          }
          console.error('');
        }
      }
    } catch (e) {
      // ignore snippet failures
    }
  },
  table: (rows: Record<string, string>) => {
    console.log('');
    console.log(kleur.bold('🚀 Nexxo Dev Server Ready'));
    const keys = Object.keys(rows);
    const maxKeyLen = Math.max(...keys.map(k => k.length));

    keys.forEach((key, i) => {
      const isLast = i === keys.length - 1;
      const prefix = isLast ? '└' : '│';
      const padding = ' '.repeat(maxKeyLen - key.length);
      console.log(`${prefix} ${kleur.cyan(key)}${padding}  ${rows[key]}`);
    });
    console.log('');
  }
};
