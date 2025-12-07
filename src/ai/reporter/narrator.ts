import { FullBuildReport } from './assembler.js';
import { AIConfig } from '../config.js';

export class LLMNarrator {
    constructor(private config: AIConfig) { }

    async narrate(report: FullBuildReport): Promise<string> {
        if (!this.config.enabled || this.config.provider === 'local') {
            return this.generateLocalSummary(report);
        }

        // TODO: Call Cloud LLM
        return this.generateLocalSummary(report);
    }

    private generateLocalSummary(report: FullBuildReport): string {
        const { session, trends, audits } = report;
        let summary = `Build ${session.success ? 'Succeeded' : 'Failed'} in ${(session.duration / 1000).toFixed(2)}s.`;

        if (trends) {
            if (trends.durationDelta < 0) summary += ` 🚀 Faster by ${Math.abs(trends.durationDelta / 1000).toFixed(2)}s.`;
            if (trends.sizeDelta < 0) summary += ` 📉 Bundle size decreased by ${(Math.abs(trends.sizeDelta) / 1024).toFixed(2)}KB.`;
        }

        if (audits) {
            const score = (
                (audits.groups.a11y?.score || 0) +
                (audits.groups.perf?.score || 0) +
                (audits.groups.seo?.score || 0)
            ) / 3;
            summary += `\nAudit Score: ${score.toFixed(0)}/100.`;
        }

        return summary;
    }
}
