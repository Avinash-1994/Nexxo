import { ParsedError } from './parser.js';
import { CommonPatterns } from '../patterns/common.js';

export interface FixAction {
    type: 'SHELL_COMMAND' | 'FILE_EDIT' | 'MANUAL_INSTRUCTION';
    description: string;
    command?: string; // For SHELL_COMMAND
    file?: string;    // For FILE_EDIT
    diff?: string;    // For FILE_EDIT
    confidence: number; // 0-1
}

export class FixGenerator {
    static generate(error: ParsedError): FixAction[] {
        const fixes: FixAction[] = [];

        // 1. Check Pattern Library
        for (const pattern of CommonPatterns) {
            const match = error.originalError.match(pattern.regex);
            if (match) {
                fixes.push(pattern.generator(match));
            }
        }

        if (fixes.length > 0) return fixes;

        // 2. Fallback to Heuristics (Legacy)
        if (error.type === 'MISSING_DEPENDENCY' && error.context.package) {
            const pkg = error.context.package;
            fixes.push({
                type: 'SHELL_COMMAND',
                description: `Install missing dependency: ${pkg}`,
                command: `npm install ${pkg}`, // TODO: Detect package manager
                confidence: 0.95
            });
        }

        if (error.type === 'SYNTAX_ERROR' && error.context.file) {
            fixes.push({
                type: 'MANUAL_INSTRUCTION',
                description: `Check syntax in ${error.context.file} at line ${error.context.line}`,
                confidence: 0.8
            });
        }

        if (error.type === 'UNKNOWN') {
            fixes.push({
                type: 'MANUAL_INSTRUCTION',
                description: 'Ask AI for help (LLM analysis required)',
                confidence: 0.5
            });
        }

        return fixes;
    }
}
