import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

const testDir = 'temp_config_test';
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

    // 1. Valid Config
    fs.writeFileSync(configFile, JSON.stringify({
        mode: 'production',
        entry: ['src/main.ts']
    }));

    // We need to compile the project first to run the CLI from dist
    // Assuming project is already built from previous steps

    // We can run the CLI using node
    const cliPath = path.resolve('dist/cli.js');

    // Mock src/main.ts so build doesn't fail on missing entry
    fs.mkdirSync(path.join(testDir, 'src'));
    fs.writeFileSync(path.join(testDir, 'src/main.ts'), 'console.log("hello")');

    console.log('Testing valid config...');
    const res1 = run(`node ${cliPath} build`);
    if (res1.status !== 0) {
        console.error('Valid config failed:', res1.stderr);
        process.exit(1);
    }
    console.log('PASS: Valid config accepted');

    // 2. Invalid Config (wrong type)
    fs.writeFileSync(configFile, JSON.stringify({
        mode: 'production',
        port: "not-a-number"
    }));

    console.log('Testing invalid config...');
    const res2 = run(`node ${cliPath} build`);
    if (res2.status === 0) {
        console.error('Invalid config should have failed!');
        process.exit(1);
    }

    if (!res2.stderr.includes('Invalid config file') && !res2.stdout.includes('Invalid config file')) {
        console.error('Error message not found in output:', res2.stderr || res2.stdout);
        process.exit(1);
    }
    console.log('PASS: Invalid config rejected');

    // Cleanup
    fs.rmSync(testDir, { recursive: true });
}

test();
