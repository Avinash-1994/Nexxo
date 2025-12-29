import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

const testDir = 'temp_init_test';
const configFile = path.join(testDir, 'urja.build.json');

function run(cmd) {
    try {
        execSync(cmd, { cwd: testDir, stdio: 'pipe' });
        return { status: 0 };
    } catch (e) {
        return { status: e.status, stdout: e.stdout.toString(), stderr: e.stderr.toString() };
    }
}

async function test() {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true });
    fs.mkdirSync(testDir);

    // 1. Setup React Project
    fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
        dependencies: { react: '^18.0.0' }
    }));
    fs.mkdirSync(path.join(testDir, 'src'));
    fs.writeFileSync(path.join(testDir, 'src/main.tsx'), '');

    const cliPath = path.resolve('dist/cli.js');

    console.log('Running init...');
    const res = run(`node ${cliPath} init`);
    if (res.status !== 0) {
        console.error('Init failed:', res.stderr);
        process.exit(1);
    }

    // 2. Verify Config
    if (!fs.existsSync(configFile)) {
        console.error('Config file not created');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    console.log('Generated config:', config);

    assert.strictEqual(config.entry[0], 'src/main.tsx');
    assert.strictEqual(config.root, '.');

    console.log('PASS: Init command works');

    // Cleanup
    fs.rmSync(testDir, { recursive: true });
}

test();
