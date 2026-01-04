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

async function scaffold(fw) {
    const projectName = `verify-${fw.name.toLowerCase()}`;
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
    }

    console.log(`🚀 Scaffolding ${fw.name}...`);

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
        child.stdout.on('data', (data) => {
            const output = data.toString();
            if (output.includes('Choose') || output.includes('Select') || output.includes('Enable') || output.includes('indices')) {
                if (currentStep < inputs.length) {
                    child.stdin.write(inputs[currentStep]);
                    currentStep++;
                }
            }
        });

        child.on('exit', (code) => {
            if (code === 0) resolve(projectPath);
            else reject(new Error(`Exit code ${code}`));
        });
    });
}

async function main() {
    for (const fw of frameworks) {
        try {
            const path = await scaffold(fw);
            const files = fs.readdirSync(path);
            console.log(`✅ ${fw.name} created at ${path}. Files: ${files.join(', ')}`);
        } catch (e) {
            console.error(`❌ Failed ${fw.name}:`, e.message);
        }
    }
}

main();
