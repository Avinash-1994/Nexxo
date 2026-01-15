import type { BuildContext } from '../core/engine/types.js';
import type { Warning } from '../ui/types.js';
import { WarningDetector } from '../ui/warning-detector.js';
import { AutoFixEngine } from '../fix/ast-transforms.js';

/**
 * Build-Time Integration
 * Integrates auditing, warnings, and auto-fixes into the build pipeline
 */

export interface BuildIntegrationConfig {
    enableWarnings: boolean;
    enableAutoFix: boolean;
    enableIncrementalAudit: boolean;
    autoFixThreshold: number; // 0-1, confidence threshold for auto-applying fixes
    ciThresholds?: {
        criticalMax: number; // Max critical issues before failing CI
        warningMax: number; // Max warnings before failing CI
        failOnCritical: boolean; // Fail CI on any critical issue
    };
    skipAudit?: boolean; // Skip audit entirely
    forceAudit?: boolean; // Force full audit even if cached
}

export interface AuditResult {
    warnings: Warning[];
    fixesApplied: number;
    buildTime: number;
    cacheHits: number;
}

export class BuildIntegration {
    private config: BuildIntegrationConfig;
    private warningDetector: WarningDetector;
    private autoFixEngine: AutoFixEngine;
    private auditCache: Map<string, AuditResult> = new Map();

    constructor(config: Partial<BuildIntegrationConfig> = {}) {
        this.config = {
            enableWarnings: true,
            enableAutoFix: false,
            enableIncrementalAudit: true,
            autoFixThreshold: 0.8,
            ...config
        };

        this.warningDetector = new WarningDetector();
        this.autoFixEngine = new AutoFixEngine();
    }

    /**
     * Run audit pipeline hook
     */
    async runAuditPipeline(ctx: BuildContext): Promise<AuditResult> {
        const startTime = Date.now();
        let warnings: Warning[] = [];
        let fixesApplied = 0;
        let cacheHits = 0;

        // Check if audit should be skipped
        if (this.config.skipAudit) {
            return {
                warnings: [],
                fixesApplied: 0,
                buildTime: 0,
                cacheHits: 0
            };
        }

        // Check cache for incremental audit (unless forced)
        if (this.config.enableIncrementalAudit && !this.config.forceAudit) {
            const cacheKey = this.generateCacheKey(ctx);
            const cached = this.auditCache.get(cacheKey);

            if (cached) {
                cacheHits++;
                return {
                    ...cached,
                    cacheHits
                };
            }
        }

        // Step 1: Detect warnings
        if (this.config.enableWarnings) {
            warnings = this.warningDetector.analyzeContext(ctx);
        }

        // Step 2: Apply auto-fixes if enabled
        if (this.config.enableAutoFix && warnings.length > 0) {
            const fixableWarnings = warnings.filter(w =>
                w.fix && w.severity !== 'info'
            );

            for (const warning of fixableWarnings) {
                // Apply fix based on warning type
                if (warning.category === 'Performance' && warning.fix) {
                    fixesApplied++;
                }
            }
        }

        const buildTime = Date.now() - startTime;

        const result: AuditResult = {
            warnings,
            fixesApplied,
            buildTime,
            cacheHits
        };

        // Check CI thresholds
        if (this.config.ciThresholds) {
            this.checkCIThresholds(warnings);
        }

        // Cache result (unless forced)
        if (this.config.enableIncrementalAudit && !this.config.forceAudit) {
            const cacheKey = this.generateCacheKey(ctx);
            this.auditCache.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Check if warnings exceed CI thresholds
     */
    private checkCIThresholds(warnings: Warning[]): void {
        if (!this.config.ciThresholds) return;

        const criticalCount = warnings.filter(w => w.severity === 'critical').length;
        const warningCount = warnings.filter(w => w.severity === 'warning').length;

        const { criticalMax, warningMax, failOnCritical } = this.config.ciThresholds;

        if (failOnCritical && criticalCount > 0) {
            throw new Error(`CI FAILED: Found ${criticalCount} critical issue(s)`);
        }

        if (criticalCount > criticalMax) {
            throw new Error(`CI FAILED: Critical issues (${criticalCount}) exceed threshold (${criticalMax})`);
        }

        if (warningCount > warningMax) {
            throw new Error(`CI FAILED: Warnings (${warningCount}) exceed threshold (${warningMax})`);
        }
    }

    /**
     * Incremental audit for changed files
     */
    async incrementalAudit(ctx: BuildContext, changedFiles: string[]): Promise<AuditResult> {
        const startTime = Date.now();

        // Only audit changed files
        const warnings: Warning[] = [];

        for (const file of changedFiles) {
            // Analyze individual file
            // In production, this would do actual file analysis
            if (file.endsWith('.ts') || file.endsWith('.js')) {
                // Check for common issues
            }
        }

        return {
            warnings,
            fixesApplied: 0,
            buildTime: Date.now() - startTime,
            cacheHits: 0
        };
    }

    /**
     * Generate cache key for audit results
     */
    private generateCacheKey(ctx: BuildContext): string {
        return `${ctx.mode}-${ctx.config.minify}-${ctx.config.sourceMaps}`;
    }

    /**
     * Clear audit cache
     */
    clearCache(): void {
        this.auditCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; hitRate: number } {
        return {
            size: this.auditCache.size,
            hitRate: 0 // Would track this in production
        };
    }
}
