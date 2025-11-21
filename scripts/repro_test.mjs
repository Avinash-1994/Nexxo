import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function run(cmd, opts = {}) {
  console.log('>', cmd);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function hashDir(dir) {
  const files = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const fp = path.join(d, name);
      const stat = fs.statSync(fp);
      if (stat.isDirectory()) walk(fp);
      else files.push(fp);
    }
  }
  walk(dir);
  files.sort();
  const hash = crypto.createHash('sha256');
  for (const f of files) {
    const data = fs.readFileSync(f);
    hash.update(data);
  }
  return { files, digest: hash.digest('hex') };
}

async function main() {
  const root = process.cwd();
  const out = path.join(root, 'build_output');

  console.log('Running reproducibility test: two clean builds');

  // First build
  execSync('rm -rf .nextgen_cache build_output', { stdio: 'inherit' });
  run('npx tsc -p tsconfig.json --outDir dist');
  run('node dist/cli.js build');
  if (!fs.existsSync(out)) {
    console.error('First build did not produce', out);
    process.exit(2);
  }
  const a = hashDir(out);
  console.log('First build digest:', a.digest);

  // Second build from clean state
  execSync('rm -rf .nextgen_cache build_output', { stdio: 'inherit' });
  run('npx tsc -p tsconfig.json --outDir dist');
  run('node dist/cli.js build');
  if (!fs.existsSync(out)) {
    console.error('Second build did not produce', out);
    process.exit(2);
  }
  const b = hashDir(out);
  console.log('Second build digest:', b.digest);

  if (a.digest === b.digest) {
    console.log('\n✅ Reproducibility test PASSED — build outputs are identical');
    process.exit(0);
  } else {
    console.error('\n❌ Reproducibility test FAILED — outputs differ');
    console.error('Files from first build:', a.files);
    console.error('Files from second build:', b.files);
    process.exit(3);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
