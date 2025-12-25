
import { detectModuleFormat, resolveConditionalExports } from './resolve.js';
import { analyzeExportsAST } from './analyze_ast.js'; // Use AST now
import { generateInteropWrapper } from './wrapper.js';
import { ExportMap, ModuleFormat } from './types.js';
import { explainReporter } from '../engine/events.js';
import fs from 'fs/promises';

// Phase 10: Main Interop Logic (Upgraded)

export class InteropEngine {
    constructor(private rootDir: string) { }

    async processModule(filePath: string, pkgJson?: any): Promise<{
        format: ModuleFormat,
        exports: ExportMap,
        wrapper?: string
    }> {
        // 1. Detect Format
        const format = await detectModuleFormat(filePath, pkgJson);
        explainReporter.report('interop', 'format', `Detected ${format} for ${filePath}`);

        // 2. Analyze Exports (AST)
        let map: ExportMap;
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            map = analyzeExportsAST(content, format === 'unknown' ? 'cjs' : format as 'esm' | 'cjs');
        } catch (e) {
            // If file read/parse fails (e.g. JSON or binary), fallback safe defaults
            map = { named: new Set(), hasDefault: true, isDynamic: true, liveBindings: false, reexports: {} };
        }

        return { format, exports: map };
    }
}

// Re-export all for consumption
export * from './types.js';
export * from './resolve.js';
export * from './analyze_ast.js'; // Export AST analyzer
export * from './wrapper.js';
