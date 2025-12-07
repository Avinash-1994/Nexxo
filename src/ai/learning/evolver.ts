import { FixStore } from '../local/fixStore.js';
import { FixAction } from '../healer/fixer.js';

export class Evolver {
    constructor(private store: FixStore) { }

    getBestFix(errorId: string): FixAction | null {
        const fixes = this.store.findFixes(errorId);
        if (fixes.length === 0) return null;

        // Simple A/B testing logic:
        // 90% time pick best fix
        // 10% time pick random fix (exploration)
        if (Math.random() > 0.1) {
            return fixes[0];
        } else {
            const randomIndex = Math.floor(Math.random() * fixes.length);
            return fixes[randomIndex];
        }
    }

    async evolve(errorId: string, failedFix: FixAction) {
        // If a fix failed, we might want to trigger LLM to generate a variant
        // For Phase 2, we just record the failure (handled by FixStore)
    }
}
