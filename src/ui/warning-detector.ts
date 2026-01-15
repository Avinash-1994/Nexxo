import { Warning } from './types.js';
import { WarningLibrary, FrameworkWarnings } from './warning-library.js';
import { BuildContext, BuildArtifact } from '../core/engine/types.js';
import { ExplainEvent } from '../core/engine/types.js';

/**
 * Warning Detector
 * Analyzes build context and artifacts to generate actionable warnings
 */
export class WarningDetector {
    private warnings: Warning[] = [];

    /**
     * Analyze build context for potential issues
     */
    analyzeContext(ctx: BuildContext): Warning[] {
        this.warnings = [];

        // Check build configuration
        this.checkBuildConfig(ctx);

        // Check dependencies
        this.checkDependencies(ctx);

        // Check framework-specific issues
        this.checkFrameworkIssues(ctx);

        return this.warnings;
    }

    /**
     * Analyze build artifacts
     */
    analyzeArtifacts(artifacts: BuildArtifact[], ctx: BuildContext): Warning[] {
        const artifactWarnings: Warning[] = [];

        for (const artifact of artifacts) {
            // Check bundle size
            if (artifact.type === 'js' && artifact.source) {
                const size = typeof artifact.source === 'string'
                    ? Buffer.byteLength(artifact.source)
                    : artifact.source.length;

                if (size > 250 * 1024) { // 250KB
                    artifactWarnings.push(WarningLibrary.LARGE_BUNDLE(size));
                }
            }

            // Check CSS size
            if (artifact.type === 'css' && artifact.source) {
                const size = typeof artifact.source === 'string'
                    ? Buffer.byteLength(artifact.source)
                    : artifact.source.length;

                if (size > 100 * 1024) { // 100KB
                    artifactWarnings.push(WarningLibrary.LARGE_CSS_FILE(
                        artifact.fileName,
                        size
                    ));
                }
            }

            // Check for duplicate modules
            if (artifact.modules) {
                const moduleCounts = new Map<string, number>();
                artifact.modules.forEach(mod => {
                    const count = moduleCounts.get(mod.id) || 0;
                    moduleCounts.set(mod.id, count + 1);
                });

                moduleCounts.forEach((count, moduleId) => {
                    if (count > 1) {
                        artifactWarnings.push(
                            WarningLibrary.DUPLICATE_MODULES(moduleId, count)
                        );
                    }
                });
            }
        }

        return artifactWarnings;
    }

    /**
     * Analyze build events for performance issues
     */
    analyzeEvents(events: ExplainEvent[]): Warning[] {
        const eventWarnings: Warning[] = [];

        // Find slow operations
        const performanceEvents = events.filter(e =>
            e.stage === 'profile' && e.data?.duration
        );

        performanceEvents.forEach(event => {
            if (event.data.duration > 1000) { // > 1 second
                eventWarnings.push({
                    id: `PERF_SLOW_${event.decision}`,
                    severity: 'info',
                    category: 'Performance',
                    message: `Slow operation detected: ${event.reason}`,
                    fix: 'Consider optimizing this operation or enabling caching'
                });
            }
        });

        return eventWarnings;
    }

    /**
     * Check build configuration
     */
    private checkBuildConfig(ctx: BuildContext): void {
        // Check if source maps are disabled
        if (!ctx.config.sourceMaps) {
            this.warnings.push(WarningLibrary.MISSING_SOURCE_MAPS());
        }

        // Check if minification is disabled in production
        if (ctx.mode === 'production' && !ctx.config.minify) {
            this.warnings.push(WarningLibrary.MISSING_MINIFICATION());
        }

        // Check if running dev mode for production
        if (ctx.mode === 'production' && process.env.NODE_ENV !== 'production') {
            this.warnings.push(WarningLibrary.DEVELOPMENT_MODE_PROD());
        }

        // Check if tree shaking is possible
        if (!ctx.config.minify && ctx.mode === 'production') {
            this.warnings.push(WarningLibrary.MISSING_TREE_SHAKING());
        }
    }

    /**
     * Check dependencies
     */
    private checkDependencies(ctx: BuildContext): void {
        // This would integrate with npm audit or similar
        // For now, we'll add a placeholder
        if (ctx.graph && ctx.graph.nodes.size > 100) {
            this.warnings.push({
                id: 'DEP_001',
                severity: 'info',
                category: 'Dependencies',
                message: `Large dependency graph detected (${ctx.graph.nodes.size} modules)`,
                fix: 'Consider code splitting or reducing dependencies'
            });
        }
    }

    /**
     * Check framework-specific issues
     */
    private checkFrameworkIssues(ctx: BuildContext): void {
        // Detect framework from config or dependencies
        const framework = this.detectFramework(ctx);

        if (framework === 'vue') {
            // Add Vue-specific checks
            this.warnings.push({
                id: 'FRAMEWORK_INFO',
                severity: 'info',
                category: 'Vue',
                message: 'Vue framework detected - running Vue-specific checks',
                fix: 'Ensure Vue SFC compiler is properly configured'
            });
        } else if (framework === 'react') {
            // Add React-specific checks
            this.warnings.push({
                id: 'FRAMEWORK_INFO',
                severity: 'info',
                category: 'React',
                message: 'React framework detected - running React-specific checks',
                fix: 'Ensure React Fast Refresh is enabled for development'
            });
        }
    }

    /**
     * Detect framework from context
     */
    private detectFramework(ctx: BuildContext): string | null {
        // Simple detection based on graph nodes
        if (!ctx.graph) return null;

        for (const [, node] of ctx.graph.nodes) {
            if (node.path.includes('vue')) return 'vue';
            if (node.path.includes('react')) return 'react';
            if (node.path.includes('svelte')) return 'svelte';
            if (node.path.includes('@angular')) return 'angular';
        }

        return null;
    }

    /**
     * Get all warnings
     */
    getWarnings(): Warning[] {
        return this.warnings;
    }

    /**
     * Clear warnings
     */
    clear(): void {
        this.warnings = [];
    }
}
