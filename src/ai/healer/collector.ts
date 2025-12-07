import { BuildSession } from '../schema.js';

export interface BuildError {
    type: 'MISSING_DEPENDENCY' | 'SYNTAX_ERROR' | 'CONFIG_ERROR' | 'RUNTIME_ERROR' | 'UNKNOWN';
    message: string;
    file?: string;
    line?: number;
    column?: number;
    raw: string;
    context?: any;
}

export class ErrorCollector {
    private errors: BuildError[] = [];

    collect(rawError: any): BuildError {
        const error = this.normalize(rawError);
        this.errors.push(error);
        return error;
    }

    getErrors(): BuildError[] {
        return this.errors;
    }

    private normalize(raw: any): BuildError {
        const message = raw.message || raw.toString();

        // Simple heuristic normalization
        if (message.includes('Module not found') || message.includes('Cannot find module')) {
            return {
                type: 'MISSING_DEPENDENCY',
                message,
                raw: message,
                context: { package: this.extractPackageName(message) }
            };
        }

        if (message.includes('SyntaxError') || message.includes('expected')) {
            return {
                type: 'SYNTAX_ERROR',
                message,
                raw: message
            };
        }

        return {
            type: 'UNKNOWN',
            message,
            raw: message
        };
    }

    private extractPackageName(msg: string): string | undefined {
        const match = msg.match(/Cannot find module '([^']+)'/) || msg.match(/Can't resolve '([^']+)'/);
        return match ? match[1] : undefined;
    }
}
