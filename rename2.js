import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'coverage' || file === '.lunx' || file === '.lunx' || file === 'package-lock.json' || file === '.lunx') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');

for (const file of files) {
    if (!file.match(/\.(js|ts|json|md|html|cjs|mjs|tsx|jsx|rs|toml)$/)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/lunx/g, 'lunx')
        .replace(/Lunx/g, 'Lunx')
        .replace(/LUNX/g, 'LUNX');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated content: ${file}`);
    }
}

// Rename directories and files
function renamePaths(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            renamePaths(fullPath);
        }
        if (file.includes('lunx')) {
            const newPath = path.join(dir, file.replace(/lunx/g, 'lunx'));
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${fullPath} -> ${newPath}`);
        }
    }
}
renamePaths('.');
