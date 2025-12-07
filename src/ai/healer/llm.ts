import { ParsedError } from './parser.js';
import { FixAction } from './fixer.js';
import { AIConfig } from '../config.js';

export class LLMFixer {
    constructor(private config: AIConfig) { }

    async fix(error: ParsedError): Promise<FixAction[]> {
        if (!this.config.enabled || this.config.provider === 'local') {
            // Local fallback or no-op
            return [];
        }

        // TODO: Implement cloud provider call
        // Prompt: "Here is a build error: ${error.message}. Context: ${JSON.stringify(error.context)}. Suggest a fix."

        return [{
            type: 'MANUAL_INSTRUCTION',
            description: 'AI Fix generation not yet connected to cloud provider.',
            confidence: 0.1
        }];
    }
}
