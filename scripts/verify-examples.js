
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const examplesDir = path.resolve(process.cwd(), 'examples');
const cliPath = path.resolve(process.cwd(), 'dist/cli.js');

const folders = fs.readdirSync(examplesDir).filter(f => {
    return fs.statSync(path.join(examplesDir, f)).isDirectory();
}).sort();

// Ensure CLI is executable
try { execSync(`chmod +x ${cliPath}`); } catch (e) { }

console.log(`🔍 Found ${folders.length} projects. Verifying stability & Zero-Config support...\n`);

const results = [];

for (const folder of folders) {
    const projectPath = path.join(examplesDir, folder);

    // Meta folders or empty folders or node_modules
    if (folder === 'fresh' || folder === 'node_modules' || folder.startsWith('.')) continue;

    process.stdout.write(`Testing [${folder.padEnd(20)}]... `);

    try {
        const hasSrc = fs.existsSync(path.join(projectPath, 'src'));
        const hasPackage = fs.existsSync(path.join(projectPath, 'package.json'));

        if (!hasSrc && !hasPackage) {
            console.log('⚠️  Skipping (Empty/Invalid)');
            continue;
        }

        // Run build (Using the full path to avoid sh/permission issues)
        // We use its own internal node_modules if they exist, otherwise it uses the root link
        execSync(`node ${cliPath} build`, {
            cwd: projectPath,
            stdio: 'ignore',
            timeout: 30000
        });

        console.log('✅ WORKING');
        results.push({ name: folder, status: 'WORKING', type: 'Framework Support' });
    } catch (error) {
        console.log('❌ FAILED');
        results.push({ name: folder, status: 'FAILED', error: 'Build error' });
    }
}

// Generate Markdown Report
let report = '# 🧪 Examples Verification Report\n\n';
report += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
report += '| Project | Status | Details |\n| :--- | :--- | :--- |\n';

results.forEach(r => {
    const icon = r.status === 'WORKING' ? '✅' : (r.status === 'SKIPPED' ? '⚠️' : '❌');
    report += `| ${r.name} | ${icon} ${r.status} | ${r.reason || (r.status === 'NOT WORKING' ? 'Build failed' : 'Verified stable')} |\n`;
});

fs.writeFileSync('EXAMPLES_REPORT.md', report);
console.log('\n✨ Report generated: EXAMPLES_REPORT.md');
