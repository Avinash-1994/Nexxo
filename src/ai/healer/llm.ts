import { ParsedError } from './parser.js';
import { FixAction } from './fixer.js';
import { AIConfig } from '../config.js';
import { OllamaProvider } from '../llm/ollama.js';

export class LLMFixer {
    private ollama: OllamaProvider;

    constructor(private config: AIConfig) {
        this.ollama = new OllamaProvider(config);
    }

    async fix(error: ParsedError): Promise<FixAction[]> {
        if (!this.config.enabled) return [];

        if (this.config.provider === 'ollama') {
            return await this.ollama.suggestFix(error);
        }

        // Generic fallback for other cloud providers
        return [{
            type: 'MANUAL_INSTRUCTION',
            description: `Cloud provider ${this.config.provider} not yet fully implemented.`,
            confidence: 0.1
        }];
    }
}
