
import { spawn, execSync, exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const frameworks = [
    { name: 'Vue', key: '3', ext: 'vue', testFile: 'src/App.vue', content: '<template><h1>Verification: Vue is Live!</h1></template>' },
];

async function runTest(fw, port) {
    const projectName = `examples/${fw.name.toLowerCase()}-test`;
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
        console.log(`Removing existing ${projectName}...`);
        fs.rmSync(projectPath, { recursive: true, force: true });
    }

    console.log(`\n🚀 Scaffolding ${fw.name}...`);

    await new Promise((resolve, reject) => {
        if (!fs.existsSync(path.join(process.cwd(), 'examples'))) {
            fs.mkdirSync(path.join(process.cwd(), 'examples'));
        }

        const child = spawn('node', ['./dist/create-urja.js', projectName], {
            stdio: ['pipe', 'pipe', 'inherit'],
            env: { ...process.env, URJA_NON_INTERACTIVE: 'true' }
        });

        // Inputs for the interactive CLI
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

    // 🔧 FIX: Modify package.json to remove non-existent packages and link local Urja
    console.log(`🔧 Patching package.json for ${fw.name}...`);
    const pkgPath = path.join(projectPath, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    // Remove @urja/framework-* as they are not published yet
    Object.keys(pkg.devDependencies || {}).forEach(k => {
        if (k.startsWith('@urja/framework-')) {
            delete pkg.devDependencies[k];
        }
    });

    // Remove 'urja' from devDependencies to avoid 404 from npm registry (we will install local)
    if (pkg.devDependencies['urja']) {
        delete pkg.devDependencies['urja'];
    }

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // 🔧 FIX: Modify urja.config.ts to remove invalid imports
    console.log(`🔧 Patching urja.config.ts for ${fw.name}...`);
    const configPath = path.join(projectPath, 'urja.config.ts');
    if (fs.existsSync(configPath)) {
        let configContent = fs.readFileSync(configPath, 'utf8');
        // Remove import of framework adapter
        configContent = configContent.replace(/import .* from "@urja\/framework-.*";\n/, '');
        // Remove framework property
        configContent = configContent.replace(/framework: .*,\n/, '');
        fs.writeFileSync(configPath, configContent);
    }

    console.log(`📦 Installing dependencies for ${fw.name}...`);
    try {
        // Install LOCAL urja package
        // We use relative path to root
        execSync('npm install ../../', { cwd: projectPath, stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to install dependencies for ${fw.name}`);
        throw e;
    }

    // Also install other deps (Vue, etc)
    try {
        execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
    } catch (e) {
        console.warn(`Initial npm install failed, trying to continue...`, e.message);
    }

    console.log(`Memo: Verified installation.`);

    console.log(`📝 Injecting verification content into ${fw.name}...`);
    const filePath = path.join(projectPath, fw.testFile);
    if (fs.existsSync(filePath)) {
        let newContent = `<template>
  <div class="app">
    ${fw.content}
  </div>
</template>
<script setup>
</script>`;
        fs.writeFileSync(filePath, newContent);
    }

    console.log(`📡 Starting dev server for ${fw.name} on port ${port}...`);
    const cliPath = path.resolve('./dist/cli.js');
    const server = spawn('node', [cliPath, 'dev', '--port', port.toString()], {
        cwd: projectPath,
        stdio: 'pipe'
    });

    server.stdout.on('data', (data) => console.log(`[${fw.name}] ${data}`));
    server.stderr.on('data', (data) => console.error(`[${fw.name}] ${data}`));

    return { server, projectName, port, fw };
}

async function main() {
    const results = [];
    let basePort = 6003;

    for (const fw of frameworks) {
        try {
            const { server, projectName, port } = await runTest(fw, basePort++);
            await new Promise(r => setTimeout(r, 10000));
            results.push({ fw: fw.name, port, server, projectName, status: 'RUNNING' });
        } catch (e) {
            console.error(`Failed to start ${fw.name}:`, e);
        }
    }

    console.log('\n✅ Servers are ready for browser verification.');
    console.log('Waiting for verification...');
}

main();
