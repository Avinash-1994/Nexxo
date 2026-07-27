// src/migrate/wasm-rewriter.ts
import fs from 'fs';
import path from 'path';

export function rewriteWasmPlugins(projectPath: string): string[] {
    const filesToExamine = ['lunx.config.ts', 'lunx.config.js', 'lunx.config.cjs', 'lunx.config.json', 'lunx.build.json', 'lunx.build.ts'];
    const rewrittenFiles: string[] = [];

    for (const file of filesToExamine) {
        const fullPath = path.join(projectPath, file);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Rewrite generic wasm dependencies or manifest paths
            const reWasm = /\.wasm(['"])/g;
            if (reWasm.test(content) || content.includes("type: 'wasm'") || content.includes('type: "wasm"')) {
                // Perform the rewrite
                content = content.replace(/\.wasm(['"])/g, '.js$1');
                content = content.replace(/type:\s*['"]wasm['"]/g, "type: 'js'");
                fs.writeFileSync(fullPath, content, 'utf8');
                rewrittenFiles.push(file);
            }
        }
    }

    return rewrittenFiles;
}
