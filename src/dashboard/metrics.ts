
/**
 * Nexxo Dashboard Metrics Collector
 * Day 19: tRPC Dashboard Lock
 */

export interface BuildMetric {
    id: string;
    timestamp: number;
    durationMs: number;
    moduleCount: number;
    cacheHitRate: number;
}

export class MetricsCollector {
    private static instance: MetricsCollector;

    // Stats
    private builds: BuildMetric[] = [];
    private errors: number = 0;
    private hmrEvents: number = 0;

    private constructor() { }

    static getInstance(): MetricsCollector {
        if (!MetricsCollector.instance) {
            MetricsCollector.instance = new MetricsCollector();
        }
        return MetricsCollector.instance;
    }

    recordBuild(durationMs: number, moduleCount: number, cacheHitRate: number) {
        this.builds.push({
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            durationMs,
            moduleCount,
            cacheHitRate
        });
        // Keep last 100
        if (this.builds.length > 100) this.builds.shift();
    }

    recordError() {
        this.errors++;
    }

    recordHMR() {
        this.hmrEvents++;
    }

    getSummary() {
        const lastBuild = this.builds[this.builds.length - 1];
        const avgDuration = this.builds.length
            ? this.builds.reduce((acc, b) => acc + b.durationMs, 0) / this.builds.length
            : 0;

        return {
            totalBuilds: this.builds.length,
            errors: this.errors,
            hmrEvents: this.hmrEvents,
            lastBuildTime: lastBuild ? lastBuild.durationMs : 0,
            avgBuildTime: avgDuration,
            cacheEfficiency: lastBuild ? lastBuild.cacheHitRate : 0
        };
    }

    generateReport(): string {
        const summary = this.getSummary();
        return JSON.stringify({
            title: 'Nexxo Build Report',
            generatedAt: new Date().toISOString(),
            stats: summary,
            history: this.builds.slice(-10) // Last 10 details
        }, null, 2);
    }
}
