import kleur from 'kleur';

export type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';
export type LogCategory = 'build' | 'hmr' | 'server' | 'cache' | 'audit' | 'general';

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
    default: return kleur.gray('GEN');
  }
};

const formatDuration = (ms: number) => {
  return ms > 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
};

export const log = {
  info: (msg: string, ctx: LogContext = {}) => {
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
    if (process.env.DEBUG) {
      const cat = ctx.category ? `[${categoryColor(ctx.category)}]` : '';
      console.log(`${time()} ${kleur.magenta('⚙')} ${cat} ${msg}`);
    }
  },
  table: (rows: Record<string, string>) => {
    console.log('');
    console.log(kleur.bold('🚀 NextGen Dev Server Ready'));
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
