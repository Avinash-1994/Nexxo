import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const frameworks = [
    { name: 'React', key: '1', ext: 'tsx', testFile: 'src/App.tsx', content: '<h1>Verification: React is Live!</h1>' },
    { name: 'Preact', key: '2', ext: 'tsx', testFile: 'src/App.tsx', content: '<h1>Verification: Preact is Live!</h1>' },
    { name: 'Vue', key: '3', ext: 'vue', testFile: 'src/App.vue', content: '<template><h1>Verification: Vue is Live!</h1></template>' },
    { name: 'Svelte', key: '4', ext: 'svelte', testFile: 'src/App.svelte', content: '<h1>Verification: Svelte is Live!</h1>' },
    { name: 'Lit', key: '5', ext: 'ts', testFile: 'src/main.ts', content: 'html`<h1>Verification: Lit is Live!</h1>`' },
    { name: 'Alpine', key: '6', ext: 'ts', testFile: 'src/main.ts', content: '<h1>Verification: Alpine is Live!</h1>' },
    { name: 'Mithril', key: '7', ext: 'tsx', testFile: 'src/main.ts', content: 'm("h1", "Verification: Mithril is Live!")' }
];

async function runTest(fw, port) {
    const projectName = `verify-${fw.name.toLowerCase()}`;
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
    }

    console.log(`\n🚀 Scaffolding ${fw.name}...`);

    await new Promise((resolve, reject) => {
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
            if (output.includes('Choose') || output.includes('Select') || output.includes('Enable') || output.includes('Project Name')) {
                if (currentStep < inputs.length) {
                    child.stdin.write(inputs[currentStep]);
                    currentStep++;
                }
            }
        });

        child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Exit code ${code}`));
        });
    });

    console.log(`📝 Injecting verification content into ${fw.name}...`);
    const filePath = path.join(projectPath, fw.testFile);
    let originalContent = fs.readFileSync(filePath, 'utf8');

    // Simple replacement logic for verification
    let newContent;
    if (fw.name === 'Lit') {
        newContent = originalContent.replace(/html`<h1>.*<\/h1>`/, fw.content);
    } else if (fw.name === 'Alpine') {
        newContent = originalContent.replace(/<h1>.*<\/h1>/, fw.content);
    } else if (fw.name === 'Mithril') {
        newContent = originalContent.replace(/m\("h1", ".*"\)/, fw.content);
    } else {
        newContent = originalContent.replace(/<h1>.*<\/h1>/, fw.content);
    }

    fs.writeFileSync(filePath, newContent);

    console.log(`📡 Starting dev server for ${fw.name} on port ${port}...`);
    const cliPath = path.resolve('./dist/cli.js');
    const server = spawn('node', [cliPath, 'dev', '--port', port.toString()], {
        cwd: projectPath,
        stdio: 'pipe'
    });

    return { server, projectName, port, fw };
}

async function main() {
    const results = [];
    let basePort = 6000;

    for (const fw of frameworks) {
        try {
            const { server, projectName, port } = await runTest(fw, basePort++);
            // We give it a few seconds to warm up
            await new Promise(r => setTimeout(r, 5000));
            results.push({ fw: fw.name, port, server, projectName, status: 'RUNNING' });
        } catch (e) {
            console.error(`Failed to start ${fw.name}:`, e);
        }
    }

    console.log('\n✅ Servers are ready for browser verification.');
    console.log(JSON.stringify(results.map(r => ({ fw: r.fw, port: r.port, url: `http://localhost:${r.port}` })), null, 2));
}

main();
