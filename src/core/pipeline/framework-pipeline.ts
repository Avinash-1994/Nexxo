
import { CoreBuildEngine } from '../engine/index.js';
import { BuildConfig } from '../../config/index.js';
import { detectFramework, Framework } from '../framework-detector.js';
import { getFrameworkPreset, FrameworkPreset } from '../../presets/frameworks.js';
import { PluginManager } from '../plugins/manager.js';
import { log } from '../../utils/logger.js';

export class FrameworkPipeline {
    private engine: CoreBuildEngine;
    private config: BuildConfig;
    private preset: FrameworkPreset;
    private framework: Framework;

    constructor(config: BuildConfig, framework: Framework) {
        this.config = config;
        this.framework = framework;
        this.preset = getFrameworkPreset(framework);
        this.engine = new CoreBuildEngine();
    }

    getEngine() { return this.engine; }
    getConfig() { return this.config; }
    getFramework() { return this.framework; }

    /**
     * Factory method to create a pipeline based on auto-detection
     */
    static async auto(config: BuildConfig): Promise<FrameworkPipeline> {
        const rootDir = config.root || process.cwd();
        const framework = await detectFramework(rootDir);
        log.info(`Pipeline: Auto-detected ${framework} workflow`);
        return new FrameworkPipeline(config, framework);
    }

    /**
     * Run the build pipeline
     * Multi-Target Orchestration (Phase E1 Honest)
     * 
     * @experimental This implementation is currently Internal/Experimental.
     * @internal Deferring full public API until Phase B/C stabilization is confirmed.
     */
    async build() {
        log.info(`Pipeline: Running ${this.framework} build...`);

        // 1. Apply Opinionated Defaults
        this.applyDefaults();

        // 2. Identify Targets
        // If targets are not specified, default to platform or framework requirements
        let targets = this.config.build?.targets;
        if (!targets || targets.length === 0) {
            if (this.config.preset === 'ssr') {
                targets = ['browser', 'node'];
            } else {
                targets = [this.config.platform || 'browser'];
            }
        }

        log.info(`Pipeline: Orchestrating ${targets.length} targets: ${targets.join(', ')}`);

        const results = [];
        const baseOutputDir = this.config.outDir;

        // 3. Run Build for Each Target
        for (const target of targets) {
            log.info(`Pipeline: Building for target [${target}]`);

            // Clone config and set target-specific output
            const targetConfig = {
                ...this.config,
                platform: target as 'browser' | 'node' | 'edge',
                // Use subdirectories for multi-target builds to prevent overwrite
                outDir: targets.length > 1 ? `${baseOutputDir}/${target}` : baseOutputDir
            };

            const result = await this.engine.run(
                targetConfig,
                this.config.mode === 'production' ? 'build' : 'dev',
                this.config.root || process.cwd()
            );

            results.push({ target, ...result });

            if (!result.success) {
                log.error(`Pipeline: Build failed for target ${target}`);
                return result; // Exit early on error
            }
        }

        // Aggregate Result
        return {
            success: true,
            targets: results,
            artifactCount: results.reduce((acc, r) => acc + (r.artifacts?.length || 0), 0)
        };
    }

    async close() {
        await this.engine.close();
    }

    public applyDefaults() {
        // Here we can merge preset options into config with "escape hatches"
        // If user already specified something, we don't override it unless necessary.

        if (!this.config.build) this.config.build = {};

        if (this.config.build.minify === undefined) {
            this.config.build.minify = this.preset.build?.minify;
        }

        if (this.config.build.splitting === undefined) {
            this.config.build.splitting = this.preset.build?.splitting;
        }

        log.debug(`Pipeline: Applied ${this.framework} defaults`, {
            minify: this.config.build.minify,
            splitting: this.config.build.splitting
        });
    }
}
