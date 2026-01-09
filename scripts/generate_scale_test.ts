import fs from 'fs/promises';
import path from 'path';

async function generateScaleProject(moduleCount: number = 10000, includeCycle: boolean = false) {
    const root = path.resolve(process.cwd(), 'scale-test-project');
    const src = path.join(root, 'src');

    console.log(`🚀 Generating scale project with ${moduleCount} modules (Cycle: ${includeCycle}) at ${root}...`);

    await fs.mkdir(src, { recursive: true });

    // 1. Create package.json
    await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({
        name: 'scale-test-project',
        version: '1.0.0',
        private: true,
        type: 'module'
    }, null, 2));

    // 2. Create nexxo.config.js
    await fs.writeFile(path.join(root, 'nexxo.config.js'), `
export default {
    entry: ['src/main.js'],
    preset: 'spa',
    plugins: [
        { name: 'website-plugin', setup: () => { } }
    ]
};
`);

    // 3. Create modules
    // We'll create a chain structure to ensure inter-dependency
    for (let i = 0; i < moduleCount; i++) {
        const imports = [];
        // Each module imports the PREVIOUS module to ensure a chain
        if (i > 0) {
            imports.push(`import { val as val_prev } from './module_${i - 1}.js';`);

            // Add 1-2 more random imports for complexity
            const extraCount = Math.floor(Math.random() * 2);
            for (let j = 0; j < extraCount; j++) {
                const target = Math.floor(Math.random() * i);
                if (target !== i - 1) {
                    imports.push(`import { val as val${target} } from './module_${target}.js';`);
                }
            }
        }

        // Introduce a cycle if requested: module 0 imports moduleCount - 1
        if (includeCycle && i === 0) {
            imports.push(`import { val as val_cycle } from './module_${moduleCount - 1}.js';`);
        }

        const content = `
${imports.join('\n')}
export const val = ${i} + (typeof val_prev !== 'undefined' ? val_prev : 0);
export const name = "module_${i}";
// console.log("Loaded " + name);
`;
        await fs.writeFile(path.join(src, `module_${i}.js`), content);
    }

    // 4. Create main entry
    const mainContent = `
import { val } from './module_${moduleCount - 1}.js';
console.log('Scale test complete. Final value:', val);
document.body.innerHTML = '<h1>Scale Test: ' + val + ' modules loaded</h1>';
`;
    await fs.writeFile(path.join(src, 'main.js'), mainContent);

    // 5. Create index.html
    await fs.writeFile(path.join(root, 'index.html'), `
<!DOCTYPE html>
<html>
<head><title>Scale Test</title></head>
<body><script type="module" src="/src/main.js"></script></body>
</html>
`);

    console.log('✅ Scale project generated.');
}

const moduleCount = parseInt(process.argv[2]) || 5000;
const includeCycle = process.argv.includes('--include-cycle');
generateScaleProject(moduleCount, includeCycle).catch(console.error);
