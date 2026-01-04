import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const projectName = 'test-svelte-app';
const projectPath = path.join(process.cwd(), projectName);

// Cleanup previous run
if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true, force: true });
}

console.log(`🚀 Testing framework selection flow for: ${projectName}`);

const child = spawn('node', ['./dist/create-urja.js', projectName], {
    stdio: ['pipe', 'pipe', 'inherit']
});

// Automated responses sequence
// 1. Framework: Svelte is 4th option
// 2. Language: TypeScript (1)
// 3. Styling: Plain CSS (1)
// 4. CSS Framework: None (1)
// 5. Project Type: Standard SPA (1)
// 6. Tooling: Yes (1)
// 7. Package Manager: npm (1)

// Note: Select uses numeric shortcuts + Enter
const inputs = [
    '4\n', // Framework: Svelte
    '1\n', // Language: TS
    '1\n', // Styling: CSS
    '1\n', // CSS Framework: None
    '1\n', // Project Type: SPA
    '1\n', // Tooling: Yes
    '1\n'  // Package Manager: npm
];

let currentStep = 0;

child.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);

    // If we see a prompt, send the next input
    // The CLI uses '?' or ':' for prompts
    if (output.includes('Select a framework') ||
        output.includes('Select language') ||
        output.includes('Select styling type') ||
        output.includes('Select a CSS framework') ||
        output.includes('Select project type') ||
        output.includes('Enable recommended tooling') ||
        output.includes('Select package manager')) {

        if (currentStep < inputs.length) {
            console.log(`\n[Test] Sending input for step ${currentStep + 1}: ${inputs[currentStep].trim()}`);
            child.stdin.write(inputs[currentStep]);
            currentStep++;
        }
    }
});

child.on('exit', (code) => {
    console.log(`\n✅ CLI exited with code ${code}`);

    // Verification
    console.log('\n🔍 Verifying generated files...');

    const checks = [
        { path: 'package.json', contains: '"svelte":' },
        { path: 'urja.config.ts', contains: 'svelte()' },
        { path: 'src/main.ts', contains: "import App from './App.svelte'" },
        { path: 'src/App.svelte', contains: '<h1>Urja + Svelte</h1>' }
    ];

    let allPassed = true;
    checks.forEach(check => {
        const fullPath = path.join(projectPath, check.path);
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(check.contains)) {
                console.log(`✅ ${check.path} verified (contains "${check.contains}")`);
            } else {
                console.log(`❌ ${check.path} verification FAILED (missing "${check.contains}")`);
                allPassed = false;
            }
        } else {
            console.log(`❌ ${check.path} MISSING`);
            allPassed = false;
        }
    });

    if (allPassed) {
        console.log('\n✨ Framework selection flow test PASSED successfully!');
        process.exit(0);
    } else {
        console.log('\n💥 Framework selection flow test FAILED!');
        process.exit(1);
    }
});
