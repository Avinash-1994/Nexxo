import { LearnedError } from '../core/errorMemory.js';
import { ProjectProfile } from '../schema.js';
import { FixAction } from '../healer/fixer.js';
import { AIConfig } from '../config.js';

export class LLMFixGenerator {
    constructor(private config: AIConfig) { }

    async generateFix(error: LearnedError, profile: ProjectProfile): Promise<FixAction[]> {
        if (!this.config.enabled || this.config.provider === 'local') {
            // Local fallback: return empty or generic suggestion
            return [{
                type: 'MANUAL_INSTRUCTION',
                description: 'Complex error detected. Please check online documentation or enable Cloud AI.',
                confidence: 0.1
            }];
        }

        // TODO: Implement Cloud Provider Call
        // Prompt:
        // Error: ${error.signature}
        // Context: ${JSON.stringify(error.context)}
        // Framework: ${profile.framework}

        return [];
    }
}
