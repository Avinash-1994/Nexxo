/**
 * Benchmark Runner - Executes performance tests across multiple build tools
 */

import { spawn, exec } from 'child_process';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';

export interface BenchmarkConfig {
    name: string;
    tool: BuildTool;
    appPath: string;
    command: string;
    args: string[];
    warmupRuns?: number;
    testRuns?: number;
    timeout?: number;
}

export type BuildTool = 'lunx' | 'vite' | 'webpack' | 'rspack' | 'esbuild' | 'turbopack' | 'parcel';

export interface BenchmarkResult {
    tool: BuildTool;
    metric: string;
    value: number;
    unit: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface ColdStartMetrics {
    tool: BuildTool;
    startupTime: number;
    memoryUsage: number;
    cpuUsage: number;
    cacheStatus: 'cold' | 'warm';
}

export interface BuildMetrics {
    tool: BuildTool;
    buildTime: number;
    bundleSize: number;
    bundleSizeGzip: number;
    bundleSizeBrotli: number;
    chunkCount: number;
    memoryPeak: number;
    cpuAverage: number;
}

export interface HMRMetrics {
    tool: BuildTool;
    detectionTime: number;
    rebuildTime: number;
    updateTime: number;
    totalLatency: number;
}

export class BenchmarkRunner {
    private results: BenchmarkResult[] = [];

    constructor(private outputDir: string = './tests/comprehensive/reports') {
        this.ensureOutputDir();
    }

    private ensureOutputDir(): void {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Measure cold start time for a dev server
     */
    async measureColdStart(config: BenchmarkConfig): Promise<ColdStartMetrics> {
        console.log(`🚀 Measuring cold start for ${config.tool}...`);

        // Clear any caches
        await this.clearCaches(config.appPath, config.tool);

        const startTime = performance.now();
        const memoryBefore = process.memoryUsage();

        return new Promise((resolve, reject) => {
            const child = spawn(config.command, config.args, {
                cwd: config.appPath,
                env: { ...process.env, NODE_ENV: 'development' },
            });

            let output = '';
            let serverReady = false;
            const timeout = setTimeout(() => {
                if (!serverReady) {
                    child.kill();
                    reject(new Error(`${config.tool} cold start timeout`));
                }
            }, config.timeout || 30000);

            child.stdout?.on('data', (data) => {
                output += data.toString();

                // Detect when server is ready (tool-specific patterns)
                if (this.isServerReady(config.tool, output)) {
                    if (!serverReady) {
                        serverReady = true;
                        const endTime = performance.now();
                        const memoryAfter = process.memoryUsage();

                        clearTimeout(timeout);
                        child.kill();

                        const metrics: ColdStartMetrics = {
                            tool: config.tool,
                            startupTime: endTime - startTime,
                            memoryUsage: (memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024,
                            cpuUsage: 0, // TODO: Implement CPU tracking
                            cacheStatus: 'cold',
                        };

                        this.recordResult({
                            tool: config.tool,
                            metric: 'cold-start',
                            value: metrics.startupTime,
                            unit: 'ms',
                            timestamp: new Date().toISOString(),
                            metadata: metrics,
                        });

                        resolve(metrics);
                    }
                }
            });

            child.stderr?.on('data', (data) => {
                output += data.toString();
            });

            child.on('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    /**
     * Measure production build performance
     */
    async measureBuild(config: BenchmarkConfig): Promise<BuildMetrics> {
        console.log(`🏗️  Measuring build for ${config.tool}...`);

        // Clean build output
        await this.cleanBuildOutput(config.appPath, config.tool);

        const startTime = performance.now();
        const memoryBefore = process.memoryUsage();

        return new Promise((resolve, reject) => {
            const child = spawn(config.command, config.args, {
                cwd: config.appPath,
                env: { ...process.env, NODE_ENV: 'production' },
            });

            let output = '';
            let memoryPeak = 0;

            const memoryMonitor = setInterval(() => {
                const current = process.memoryUsage().heapUsed;
                if (current > memoryPeak) memoryPeak = current;
            }, 100);

            child.stdout?.on('data', (data) => {
                output += data.toString();
            });

            child.stderr?.on('data', (data) => {
                output += data.toString();
            });

            child.on('close', async (code) => {
                clearInterval(memoryMonitor);
                const endTime = performance.now();

                if (code !== 0) {
                    reject(new Error(`${config.tool} build failed with code ${code}\n${output}`));
                    return;
                }

                try {
                    const distPath = this.getDistPath(config.appPath, config.tool);
                    const bundleStats = await this.analyzeBundleSize(distPath);

                    const metrics: BuildMetrics = {
                        tool: config.tool,
                        buildTime: endTime - startTime,
                        bundleSize: bundleStats.size,
                        bundleSizeGzip: bundleStats.gzipSize,
                        bundleSizeBrotli: bundleStats.brotliSize,
                        chunkCount: bundleStats.chunkCount,
                        memoryPeak: memoryPeak / 1024 / 1024,
                        cpuAverage: 0, // TODO: Implement CPU tracking
                    };

                    this.recordResult({
                        tool: config.tool,
                        metric: 'build-time',
                        value: metrics.buildTime,
                        unit: 'ms',
                        timestamp: new Date().toISOString(),
                        metadata: metrics,
                    });

                    resolve(metrics);
                } catch (error) {
                    reject(error);
                }
            });

            child.on('error', (error) => {
                clearInterval(memoryMonitor);
                reject(error);
            });
        });
    }

    /**
     * Measure HMR performance
     */
    async measureHMR(config: BenchmarkConfig, fileToChange: string): Promise<HMRMetrics> {
        console.log(`⚡ Measuring HMR for ${config.tool}...`);

        // Start dev server
        const child = spawn(config.command, config.args, {
            cwd: config.appPath,
            env: { ...process.env, NODE_ENV: 'development' },
        });

        return new Promise((resolve, reject) => {
            let serverReady = false;
            let hmrTriggered = false;
            let detectionTime = 0;
            let rebuildTime = 0;
            let changeTime = 0;

            child.stdout?.on('data', (data) => {
                const output = data.toString();

                if (!serverReady && this.isServerReady(config.tool, output)) {
                    serverReady = true;

                    // Trigger file change after server is ready
                    setTimeout(() => {
                        changeTime = performance.now();
                        this.triggerFileChange(path.join(config.appPath, fileToChange));
                    }, 1000);
                }

                if (serverReady && !hmrTriggered && this.isHMRTriggered(config.tool, output)) {
                    hmrTriggered = true;
                    detectionTime = performance.now() - changeTime;
                }

                if (hmrTriggered && this.isHMRComplete(config.tool, output)) {
                    const totalTime = performance.now() - changeTime;
                    rebuildTime = totalTime - detectionTime;

                    child.kill();

                    const metrics: HMRMetrics = {
                        tool: config.tool,
                        detectionTime,
                        rebuildTime,
                        updateTime: 0, // Browser update time (requires browser automation)
                        totalLatency: totalTime,
                    };

                    this.recordResult({
                        tool: config.tool,
                        metric: 'hmr-latency',
                        value: metrics.totalLatency,
                        unit: 'ms',
                        timestamp: new Date().toISOString(),
                        metadata: metrics,
                    });

                    resolve(metrics);
                }
            });

            setTimeout(() => {
                child.kill();
                reject(new Error(`${config.tool} HMR test timeout`));
            }, config.timeout || 30000);
        });
    }

    /**
     * Run multiple iterations and return average
     */
    async runBenchmark(
        config: BenchmarkConfig,
        type: 'cold-start' | 'build' | 'hmr',
        iterations: number = 3
    ): Promise<any> {
        const results: any[] = [];

        for (let i = 0; i < iterations; i++) {
            console.log(`\n📊 Iteration ${i + 1}/${iterations}`);

            try {
                let result;
                switch (type) {
                    case 'cold-start':
                        result = await this.measureColdStart(config);
                        break;
                    case 'build':
                        result = await this.measureBuild(config);
                        break;
                    case 'hmr':
                        result = await this.measureHMR(config, 'src/App.tsx');
                        break;
                }
                results.push(result);

                // Wait between iterations
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`❌ Iteration ${i + 1} failed:`, error);
            }
        }

        return this.calculateAverage(results);
    }

    /**
     * Helper: Check if server is ready (tool-specific)
     */
    private isServerReady(tool: BuildTool, output: string): boolean {
        const patterns: Record<BuildTool, RegExp[]> = {
            lunx: [/ready in/i, /server running/i, /http:\/\/localhost/i],
            vite: [/ready in/i, /local:.*http/i],
            webpack: [/compiled successfully/i, /webpack.*compiled/i],
            rspack: [/compiled successfully/i, /rspack.*compiled/i],
            esbuild: [/http:\/\/localhost/i, /serving/i],
            turbopack: [/ready/i, /local:.*http/i],
            parcel: [/built in/i, /server running/i],
        };

        return patterns[tool]?.some(pattern => pattern.test(output)) || false;
    }

    /**
     * Helper: Check if HMR was triggered
     */
    private isHMRTriggered(tool: BuildTool, output: string): boolean {
        return /hmr|hot|update|reload/i.test(output);
    }

    /**
     * Helper: Check if HMR is complete
     */
    private isHMRComplete(tool: BuildTool, output: string): boolean {
        return /updated|reloaded|done/i.test(output);
    }

    /**
     * Helper: Clear caches
     */
    private async clearCaches(appPath: string, tool: BuildTool): Promise<void> {
        const cacheDirs = [
            'node_modules/.vite',
            'node_modules/.cache',
            '.lunx_cache',
            'dist',
            'build',
            '.next',
            '.parcel-cache',
        ];

        for (const dir of cacheDirs) {
            const fullPath = path.join(appPath, dir);
            if (fs.existsSync(fullPath)) {
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        }
    }

    /**
     * Helper: Clean build output
     */
    private async cleanBuildOutput(appPath: string, tool: BuildTool): Promise<void> {
        await this.clearCaches(appPath, tool);
    }

    /**
     * Helper: Get dist path for tool
     */
    private getDistPath(appPath: string, tool: BuildTool): string {
        const distPaths: Record<BuildTool, string> = {
            lunx: 'dist',
            vite: 'dist',
            webpack: 'dist',
            rspack: 'dist',
            esbuild: 'dist',
            turbopack: '.next',
            parcel: 'dist',
        };

        return path.join(appPath, distPaths[tool]);
    }

    /**
     * Helper: Analyze bundle size
     */
    private async analyzeBundleSize(distPath: string): Promise<{
        size: number;
        gzipSize: number;
        brotliSize: number;
        chunkCount: number;
    }> {
        const { execSync } = require('child_process');

        try {
            const sizeOutput = execSync(`du -sb ${distPath}`, { encoding: 'utf-8' });
            const size = parseInt(sizeOutput.split('\t')[0]);

            const files = this.getAllFiles(distPath);
            const jsFiles = files.filter(f => f.endsWith('.js'));

            return {
                size: size / 1024, // KB
                gzipSize: 0, // TODO: Calculate gzip size
                brotliSize: 0, // TODO: Calculate brotli size
                chunkCount: jsFiles.length,
            };
        } catch (error) {
            return { size: 0, gzipSize: 0, brotliSize: 0, chunkCount: 0 };
        }
    }

    /**
     * Helper: Get all files recursively
     */
    private getAllFiles(dir: string): string[] {
        const files: string[] = [];

        if (!fs.existsSync(dir)) return files;

        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Helper: Trigger file change
     */
    private triggerFileChange(filePath: string): void {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            fs.writeFileSync(filePath, content + '\n// HMR test change\n');
        }
    }

    /**
     * Helper: Calculate average of results
     */
    private calculateAverage(results: any[]): any {
        if (results.length === 0) return null;

        const avg: any = { ...results[0] };
        const numericKeys = Object.keys(avg).filter(k => typeof avg[k] === 'number');

        for (const key of numericKeys) {
            const sum = results.reduce((acc, r) => acc + (r[key] || 0), 0);
            avg[key] = sum / results.length;
        }

        return avg;
    }

    /**
     * Record a benchmark result
     */
    private recordResult(result: BenchmarkResult): void {
        this.results.push(result);
    }

    /**
     * Get all recorded results
     */
    getResults(): BenchmarkResult[] {
        return this.results;
    }

    /**
     * Save results to file
     */
    saveResults(filename: string = 'benchmark-results.json'): void {
        const outputPath = path.join(this.outputDir, filename);
        fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
        console.log(`\n✅ Results saved to ${outputPath}`);
    }

    /**
     * Clear all results
     */
    clearResults(): void {
        this.results = [];
    }
}
