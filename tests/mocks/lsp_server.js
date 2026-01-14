/**
 * Nexxo Language Server Logic (Mock for Tests)
 * Copied from extensions/vscode-lsp to ensure reliable loading in tests
 */

export class NexxoLSPServer {
    constructor() {
        console.log('Nexxo LSP Initialized');
    }

    onCompletion(documentText, position) {
        const lines = documentText.split('\n');
        const line = lines[position.line];

        if (line.includes('plugins:') || (line.trim().startsWith('[') && lines[position.line - 1]?.includes('plugins:'))) {
            return [
                { label: '@nexxo/plugin-react', kind: 9, detail: 'React 19 Adapter' },
                { label: '@nexxo/plugin-vue', kind: 9, detail: 'Vue 3 Adapter' },
                { label: '@nexxo/plugin-tailwindcss', kind: 9, detail: 'Tailwind JIT' },
                { label: '@nexxo/plugin-visualizer', kind: 9, detail: 'Bundle Analysis' }
            ];
        }

        if (line.includes('mode:')) {
            return [
                { label: "'development'", kind: 12, detail: 'Dev Mode' },
                { label: "'production'", kind: 12, detail: 'Prod Mode' }
            ];
        }

        return [];
    }

    validate(documentText) {
        const diagnostics = [];
        const lines = documentText.split('\n');

        lines.forEach((line, i) => {
            if (line.includes("mode: 'prod'")) {
                diagnostics.push({
                    range: { start: { line: i, character: line.indexOf("'prod'") }, end: { line: i, character: line.indexOf("'prod'") + 6 } },
                    severity: 2,
                    message: "Did you mean 'production'?",
                    source: 'Nexxo LSP'
                });
            }

            if (line.includes("import * as _ from 'lodash'")) {
                diagnostics.push({
                    range: { start: { line: i, character: 0 }, end: { line: i, character: line.length } },
                    severity: 3,
                    message: "Performance: Prefer default import or lodash-es for better tree-shaking.",
                    source: 'Nexxo Perf'
                });
            }
        });

        return diagnostics;
    }
}
