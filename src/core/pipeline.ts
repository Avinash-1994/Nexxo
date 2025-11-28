import { BuildConfig } from '../config/index.js';
import { log } from '../utils/logger.js';
import { PluginManager } from '../plugins/index.js';

export interface PipelineContext {
    config: BuildConfig;
    pluginManager: PluginManager;
    entryPoints: Record<string, string>;
    files: Record<string, string>; // Virtual file system for intermediate steps
    artifacts: string[]; // List of output files
    startTime: number;
}

export interface PipelineStep {
    name: string;
    run(context: PipelineContext): Promise<void>;
}

export class BuildPipeline {
    private steps: PipelineStep[] = [];
    private context: PipelineContext;

    constructor(config: BuildConfig) {
        this.context = {
            config,
            pluginManager: new PluginManager(),
            entryPoints: {},
            files: {},
            artifacts: [],
            startTime: Date.now(),
        };

        // Register plugins from config
        if (config.plugins) {
            config.plugins.forEach(p => this.context.pluginManager.register(p));
        }
    }

    addStep(step: PipelineStep): this {
        this.steps.push(step);
        return this;
    }

    async execute(): Promise<PipelineContext> {
        log.info('Starting Build Pipeline...');

        for (const step of this.steps) {
            try {
                log.info(`[Pipeline] Running step: ${step.name}`);
                const start = Date.now();
                await step.run(this.context);
                const duration = Date.now() - start;
                log.info(`[Pipeline] Step ${step.name} completed in ${duration}ms`);
            } catch (error: any) {
                log.error(`[Pipeline] Step ${step.name} failed:`, error);
                throw error;
            }
        }

        const totalTime = Date.now() - this.context.startTime;
        log.success(`Build Pipeline completed in ${totalTime}ms`);
        return this.context;
    }
}
