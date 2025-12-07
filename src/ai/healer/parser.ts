export type ErrorType = 'MISSING_DEPENDENCY' | 'SYNTAX_ERROR' | 'CONFIG_ERROR' | 'UNKNOWN';

export interface ParsedError {
    type: ErrorType;
    message: string;
    context: {
        package?: string;
        file?: string;
        line?: number;
        column?: number;
        snippet?: string;
    };
    originalError: string;
}

export class ErrorParser {
    static parse(error: string): ParsedError {
        // 1. Missing Dependency
        // "Module not found: Error: Can't resolve 'react'"
        // "Error: Cannot find module 'react'"
        const missingDepMatch = error.match(/Can't resolve '(@?[\w-]+(?:\/[\w-]+)*)'/i) ||
            error.match(/Cannot find module '(@?[\w-]+(?:\/[\w-]+)*)'/i);

        if (missingDepMatch) {
            return {
                type: 'MISSING_DEPENDENCY',
                message: `Missing dependency: ${missingDepMatch[1]}`,
                context: { package: missingDepMatch[1] },
                originalError: error
            };
        }

        // 2. Syntax Error
        // "SyntaxError: Unexpected token (10:5)"
        // "file.ts(10,5): error TS1005: ')' expected."
        const syntaxMatch = error.match(/(.*?)\((\d+),(\d+)\): error TS/);
        if (syntaxMatch) {
            return {
                type: 'SYNTAX_ERROR',
                message: 'Syntax Error',
                context: {
                    file: syntaxMatch[1],
                    line: parseInt(syntaxMatch[2]),
                    column: parseInt(syntaxMatch[3])
                },
                originalError: error
            };
        }

        // 3. React Version Mismatch
        if (error.includes('Invalid hook call') || error.includes('more than one copy of React')) {
            return {
                type: 'CONFIG_ERROR',
                message: 'React Version Mismatch',
                context: { snippet: 'Multiple React versions detected' },
                originalError: error
            };
        }

        // 4. Missing Loader
        const loaderMatch = error.match(/You may need an appropriate loader to handle this file type/);
        if (loaderMatch) {
            return {
                type: 'CONFIG_ERROR',
                message: 'Missing Loader',
                context: { snippet: 'File type not supported by current config' },
                originalError: error
            };
        }

        // 5. Config Error (Generic heuristic)
        if (error.toLowerCase().includes('config') || error.toLowerCase().includes('json')) {
            return {
                type: 'CONFIG_ERROR',
                message: 'Configuration Error',
                context: {},
                originalError: error
            };
        }

        return {
            type: 'UNKNOWN',
            message: 'Unknown Build Error',
            context: {},
            originalError: error
        };
    }
}
