import kleur from 'kleur';

export const log = {
  info: (...args: any[]) => console.log(kleur.cyan('[info]'), ...args),
  warn: (...args: any[]) => console.warn(kleur.yellow('[warn]'), ...args),
  error: (...args: any[]) => console.error(kleur.red('[error]'), ...args),
  success: (...args: any[]) => console.log(kleur.green('[ok]'), ...args),
};
