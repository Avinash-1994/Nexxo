import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const frameworks = [
    { name: 'React', key: '1' },
    { name: 'Preact', key: '2' },
    { name: 'Vue', key: '3' },
    { name: 'Svelte', key: '4' },
    { name: 'Lit', key: '5' },
    { name: 'Alpine', key: '6' },
    { name: 'Mithril', key: '7' }
];

async function runTest(fw) {
    const projectName = `verify-${fw.name.toLowerCase()}`;
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
    }

    console.log(`\n🚀 Testing ${fw.name} selection...`);

    return new Promise((resolve, reject) => {
        const child = spawn('node', ['./dist/create-urja.js', projectName], {
            stdio: ['pipe', 'pipe', 'inherit'],
            env: { ...process.env, URJA_NON_INTERACTIVE: 'true' }
        });

        const inputs = [
            `${fw.key}\n`, // Framework
            '1\n', // Language: TS
            '1\n', // Styling: CSS
            '1\n', // CSS Framework: None
            '1\n', // Project Type: SPA
            '1\n', // Tooling: Yes
            '1\n'  // Package Manager: npm
        ];

        let currentStep = 0;
        let lastMatch = '';

        child.stdout.on('data', (data) => {
            const output = data.toString();
            process.stdout.write(data);

            const keywords = ['Choose', 'Select', 'Enable', 'indices'];
            const found = keywords.find(k => output.includes(k));

            if (found && currentStep < inputs.length) {
                // If we found a new prompt, or the same prompt but we haven't answered it yet
                // For simplicity, we'll just check if we have more inputs
                const nextInput = inputs[currentStep];
                if (nextInput) {
                    setTimeout(() => {
                        if (child.stdin.writable) {
                            child.stdin.write(nextInput);
                        }
                    }, 100);
                    currentStep++;
                }
            }
        });

        child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Exit code ${code}`));
        });

        setTimeout(() => {
            child.kill();
            reject(new Error('Timeout'));
        }, 15000);
    });
}

async function main() {
    for (const fw of frameworks) {
        try {
            await runTest(fw);
            console.log(`✅ ${fw.name} scaffolded successfully.`);
        } catch (e) {
            console.error(`❌ Failed ${fw.name}:`, e.message);
        }
    }
}

main();
