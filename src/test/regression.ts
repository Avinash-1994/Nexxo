import { spawnSync } from 'child_process';

const steps = [
    { name: 'Unit Tests', cmd: 'npx', args: ['tsx', 'src/test/runner.ts'] },
    { name: 'Determinism Check', cmd: 'npx', args: ['tsx', 'src/test/determinism.ts'] },
    { name: 'Security Check', cmd: 'npx', args: ['tsx', 'src/test/runner.ts', 'tests/e2e/security.test.ts'] },
    { name: 'Smoke Test', cmd: 'npx', args: ['tsx', 'src/test/runner.ts', 'tests/e2e/smoke.test.ts'] }
];

console.log('🚀 Starting Regression Gate (Day 42)...');

let failed = false;

for (const step of steps) {
    console.log(`\n▶ Running ${step.name}...`);
    // use shell: true for npx on windows/linux compatibility, though child_process matches OS
    const result = spawnSync(step.cmd, step.args, { stdio: 'inherit', shell: true });

    if (result.status !== 0) {
        console.error(`❌ ${step.name} FAILED!`);
        failed = true;
        break;
    } else {
        console.log(`✅ ${step.name} PASSED`);
    }
}

if (failed) {
    console.error('\n💥 Regression Gate FAILED.');
    process.exit(1);
} else {
    console.log('\n✨ All Systems Operational. Regression Gate Passed.');
    process.exit(0);
}
