
/**
 * Create-Nexxo CLI
 * Generates projects for 12 frameworks in <30s
 * Day 17: Create-Nexxo Templates Lock
 */

import * as fs from 'fs';
import * as path from 'path';
import { TEMPLATES } from './templates.js';
import { red, green, blue, bold } from 'kleur/colors';

async function main() {
    const args = process.argv.slice(2);
    // Usage: node cli.js <project-name> --template <template>

    let projectName = args[0];
    let templateName = args.indexOf('--template') > -1 ? args[args.indexOf('--template') + 1] : null;

    // Interactive Stub (For real usage, use prompts/inquirer)
    if (!projectName) {
        console.error(red('Please specify project name: create-nexxo <name>'));
        process.exit(1);
    }

    if (!templateName) {
        console.log(blue('Available templates:'));
        Object.keys(TEMPLATES).forEach(t => console.log(`- ${t}`));
        console.error(red('Please specify template: --template <name>'));
        process.exit(1);
    }

    const template = TEMPLATES[templateName];
    if (!template) {
        console.error(red(`Unknown template: ${templateName}`));
        process.exit(1);
    }

    const targetDir = path.resolve(process.cwd(), projectName);
    if (fs.existsSync(targetDir)) {
        console.error(red(`Target directory ${projectName} already exists`));
        process.exit(1);
    }

    console.log(blue(`\n🚀 Scaffolding ${bold(template.name)} project in ${bold(projectName)}...`));

    // 1. Create Dir
    fs.mkdirSync(targetDir, { recursive: true });

    // 2. Create Files
    for (const file of template.files) {
        const filePath = path.join(targetDir, file.path);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(filePath, file.content);
    }

    // 3. Create package.json
    const pkg = {
        name: projectName,
        version: '0.0.0',
        type: 'module',
        scripts: {
            "dev": "nexxo dev",
            "build": "nexxo build",
            "preview": "nexxo preview"
        },
        dependencies: template.dependencies,
        devDependencies: {
            ...template.devDependencies,
            "nexxo": "latest"
        }
    };
    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));

    console.log(green(`\n✅ Done. Now run:\n`));
    console.log(`  cd ${projectName}`);
    console.log(`  npm install`);
    console.log(`  npm run dev\n`);
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => console.error(err));
}

export { main }; // For testing
