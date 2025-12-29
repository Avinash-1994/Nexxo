import { BuildSession } from '../schema.js';

export class ReportGenerator {
    static generate(session: BuildSession): string {
        const status = session.success ? '✅ SUCCESS' : '❌ FAILED';
        const duration = (session.duration / 1000).toFixed(2);
        const date = new Date(session.timestamp).toLocaleString();

        let report = `# Build Report\n\n`;
        report += `**Status**: ${status}\n`;
        report += `**Date**: ${date}\n`;
        report += `**Duration**: ${duration}s\n\n`;

        // Metrics
        if (session.metrics) {
            report += `## Metrics\n`;
            if (session.metrics.modules) report += `- **Modules**: ${session.metrics.modules}\n`;
            if (session.metrics.bundleSize) report += `- **Bundle Size**: ${(session.metrics.bundleSize / 1024).toFixed(2)} KB\n`;
            if (session.metrics.cacheHits) report += `- **Cache Hits**: ${session.metrics.cacheHits}\n`;
            report += `\n`;
        }

        // Errors
        if (session.errors && session.errors.length > 0) {
            report += `## Errors\n`;
            session.errors.forEach(err => {
                report += `> 🔴 ${err}\n`;
            });
            report += `\n`;
        }

        // Insights (Simple heuristics for now, LLM later)
        report += `## Insights\n`;
        if (session.duration > 5000) {
            report += `- 🐢 Build took longer than 5s. Consider enabling code splitting or caching.\n`;
        } else {
            report += `- ⚡ Fast build! Keep it up.\n`;
        }

        if (session.metrics?.bundleSize && session.metrics.bundleSize > 1024 * 1024) {
            report += `- 📦 Bundle is large (>1MB). Run \`urja optimize\` to analyze.\n`;
        }

        return report;
    }
}
