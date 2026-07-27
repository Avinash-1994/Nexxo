/**
 * lunx migrate — config and plugin migration from older Lunx versions
 */
import fs from 'node:fs';
import path from 'node:path';

interface MigrateOptions {
  yes?: boolean;
}

const MIGRATIONS = [
  {
    id: 'M01',
    title: 'Rename nuclie.config.* → lunx.config.*',
    detect: (root: string) =>
      ['nuclie.config.js', 'nuclie.config.ts', 'nuclie.config.json'].find(f =>
        fs.existsSync(path.join(root, f))
      ),
    apply: (root: string) => {
      const old = ['nuclie.config.js', 'nuclie.config.ts', 'nuclie.config.json'].find(f =>
        fs.existsSync(path.join(root, f))
      );
      if (!old) return;
      const ext = path.extname(old);
      const newName = `lunx.config${ext}`;
      fs.renameSync(path.join(root, old), path.join(root, newName));
      console.log(`  ✅ Renamed ${old} → ${newName}`);
    }
  },
  {
    id: 'M02',
    title: 'Rewrite @nuclie/* imports → @lunx/* in package.json',
    detect: (root: string) => {
      const pkgPath = path.join(root, 'package.json');
      if (!fs.existsSync(pkgPath)) return undefined;
      const content = fs.readFileSync(pkgPath, 'utf8');
      return content.includes('@nuclie/') ? pkgPath : undefined;
    },
    apply: (root: string) => {
      const pkgPath = path.join(root, 'package.json');
      if (!fs.existsSync(pkgPath)) return;
      const content = fs.readFileSync(pkgPath, 'utf8');
      const updated = content.replace(/@nuclie\//g, '@lunx/');
      fs.writeFileSync(pkgPath, updated, 'utf8');
      console.log('  ✅ Rewrote @nuclie/* → @lunx/* in package.json');
    }
  },
  {
    id: 'M03',
    title: 'Rewrite @nuclie/* imports in source files',
    detect: (root: string) => {
      const srcDir = path.join(root, 'src');
      if (!fs.existsSync(srcDir)) return undefined;
      const files = findSourceFiles(srcDir);
      return files.find(f => fs.readFileSync(f, 'utf8').includes('@nuclie/')) ? srcDir : undefined;
    },
    apply: (root: string) => {
      const srcDir = path.join(root, 'src');
      if (!fs.existsSync(srcDir)) return;
      const files = findSourceFiles(srcDir);
      let count = 0;
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('@nuclie/')) {
          fs.writeFileSync(file, content.replace(/@nuclie\//g, '@lunx/'), 'utf8');
          count++;
        }
      }
      console.log(`  ✅ Rewrote @nuclie/* → @lunx/* in ${count} source file(s)`);
    }
  }
];

function findSourceFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.lunx', 'dist', 'build_output'].includes(entry.name)) {
      results.push(...findSourceFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

export async function runMigrate(root: string, options: MigrateOptions = {}): Promise<void> {
  console.log('\n🔄 Lunx Migration Tool\n' + '─'.repeat(40));

  const applicable = MIGRATIONS.filter(m => m.detect(root));

  if (applicable.length === 0) {
    console.log('\n  ✅ No migrations needed — project is up to date.\n');
    return;
  }

  console.log(`\n  Found ${applicable.length} migration(s):\n`);
  applicable.forEach(m => console.log(`  [${m.id}] ${m.title}`));

  if (!options.yes) {
    const readline = await import('node:readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>(resolve => {
      rl.question('\n  Apply all? [Y/n] ', resolve);
    });
    rl.close();
    if (answer.toLowerCase() === 'n') {
      console.log('\n  Aborted. No changes made.\n');
      return;
    }
  }

  console.log('\n  Applying migrations...\n');
  for (const m of applicable) {
    console.log(`  → [${m.id}] ${m.title}`);
    m.apply(root);
  }

  console.log('\n' + '─'.repeat(40));
  console.log('  ✅ Migration complete.\n');
}
