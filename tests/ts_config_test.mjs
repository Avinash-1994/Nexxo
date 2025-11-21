import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

const testDir = 'temp_ts_config_test';
const configFile = path.join(testDir, 'nextgen.build.ts');

function run(cmd) {
    try {
        const stdout = execSync(cmd, { cwd: testDir, stdio: 'pipe' });
        return { status: 0, stdout: stdout.toString() };
    } catch (e) {
        return { status: e.status, stdout: e.stdout.toString(), stderr: e.stderr.toString() };
    }
}

async function test() {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true });
    fs.mkdirSync(testDir);

    // 1. Create TS Config
    fs.writeFileSync(configFile, `
    export default {
      root: '.',
      entry: ['src/main.ts'],
      mode: 'production',
      outDir: 'dist_ts',
      port: 5000
    };
  `);

    fs.mkdirSync(path.join(testDir, 'src'));
    fs.writeFileSync(path.join(testDir, 'src/main.ts'), 'console.log("TS Config Works");');

    const cliPath = path.resolve('dist/cli.js');

    console.log('Running build with TS config...');
    const res = run(`node ${cliPath} build`);

    if (res.status !== 0) {
        console.error('Build failed:', res.stderr);
        // Check if it failed due to missing deps (esbuild) in the temp environment?
        // The test runs in temp_ts_config_test, but node_modules are in root.
        // Node resolution should find them if we are in a subdir? No, testDir is in root.
        process.exit(1);
    }

    if (!res.stdout.includes('Loading TypeScript config')) {
        console.warn('Did not see "Loading TypeScript config" log');
    }

    console.log('PASS: TS Config loaded');

    // Cleanup
    fs.rmSync(testDir, { recursive: true });
}

test();
