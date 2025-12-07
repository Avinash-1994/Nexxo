import { ProjectProfile } from '../schema.js';
import { OptimizationSuggestion } from './rules.js';
import { AIConfig } from '../config.js';

export class LLMAdapter {
    constructor(private config: AIConfig) { }

    async refine(profile: ProjectProfile, suggestions: OptimizationSuggestion[]): Promise<OptimizationSuggestion[]> {
        if (!this.config.enabled || this.config.provider === 'local') {
            // Local mode: just return static suggestions for now
            // In a real local LLM setup, we would call the local model here
            return suggestions;
        }

        // TODO: Implement cloud provider call
        return suggestions;
    }
}
