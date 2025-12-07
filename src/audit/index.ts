import { AccessibilityAudit } from './a11y.js';
import { PerformanceAudit } from './perf.js';
import { SEOAudit } from './seo.js';
import { AuditReport } from './types.js';

export class AuditEngine {
    static async runAll(urlOrPath: string): Promise<AuditReport> {
        const [a11y, perf, seo] = await Promise.all([
            AccessibilityAudit.run(urlOrPath),
            PerformanceAudit.run(urlOrPath),
            SEOAudit.run(urlOrPath)
        ]);

        return {
            timestamp: Date.now(),
            groups: {
                a11y,
                perf,
                seo
            }
        };
    }
}
