
/**
 * Nexxo Language Server Logic
 * Day 18: VS Code LSP Extension Lock
 */

// We simulate the LSP types to keep this file standalone without npm install vscode-languageserver
export interface CompletionItem {
    label: string;
    kind: number;
    detail?: string;
}

export interface Diagnostic {
    range: { start: { line: number, character: number }, end: { line: number, character: number } };
    severity: number;
    message: string;
    source: string;
}

export class NexxoLSPServer {

    constructor() {
        console.log('Nexxo LSP Initialized');
    }

    /**
     * Handle Completion Requests
     */
    onCompletion(documentText: string, position: { line: number, character: number }): CompletionItem[] {
        const lines = documentText.split('\n');
        const line = lines[position.line];

        // 1. Plugins Completion
        // Heuristic: Check if we are inside `plugins: [`
        // In a real server we use AST, here regex/includes for speed MVP
        if (line.includes('plugins:') || (line.trim().startsWith('[') && lines[position.line - 1]?.includes('plugins:'))) {
            return [
                { label: '@nexxo/plugin-react', kind: 9, detail: 'React 19 Adapter' },
                { label: '@nexxo/plugin-vue', kind: 9, detail: 'Vue 3 Adapter' },
                { label: '@nexxo/plugin-tailwindcss', kind: 9, detail: 'Tailwind JIT' },
                { label: '@nexxo/plugin-visualizer', kind: 9, detail: 'Bundle Analysis' }
            ];
        }

        // 2. Mode Completion
        if (line.includes('mode:')) {
            return [
                { label: "'development'", kind: 12, detail: 'Dev Mode' },
                { label: "'production'", kind: 12, detail: 'Prod Mode' }
            ];
        }

        return [];
    }

    /**
     * Handle Document Validation
     */
    validate(documentText: string): Diagnostic[] {
        const diagnostics: Diagnostic[] = [];
        const lines = documentText.split('\n');

        lines.forEach((line, i) => {
            // Rule 1: Incorrect Mode
            if (line.includes("mode: 'prod'")) {
                diagnostics.push({
                    range: { start: { line: i, character: line.indexOf("'prod'") }, end: { line: i, character: line.indexOf("'prod'") + 6 } },
                    severity: 2, // Warning
                    message: "Did you mean 'production'?",
                    source: 'Nexxo LSP'
                });
            }

            // Rule 2: Large Import Warning (Simulated Performance Tip)
            if (line.includes("import * as _ from 'lodash'")) {
                diagnostics.push({
                    range: { start: { line: i, character: 0 }, end: { line: i, character: line.length } },
                    severity: 3, // Info
                    message: "Performance: Prefer default import or lodash-es for better tree-shaking.",
                    source: 'Nexxo Perf'
                });
            }
        });

        return diagnostics;
    }
}

// Entry point stub (would connect to process.stdin/stdout)
if (process.argv.includes('--stdio')) {
    // Connect to VSCode (Mocked)
    // In real impl: createConnection(ProposedFeatures.all).listen();
}
