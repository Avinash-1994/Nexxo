/**
 * Build Steps - Bundler Step Implementation
 * This file provides the BundlerStep class for production builds
 */

import { CoreBuildEngine } from './engine/index.js';
import { BuildConfig } from '../config/index.js';

export class BundlerStep {
    async run(ctx: any): Promise<void> {
        const engine = new CoreBuildEngine();

        // Run the build using the core engine
        const result = await engine.run(
            ctx.config,
            'build',
            ctx.config.root
        );

        if (!result.success) {
            throw new Error(`Build failed: ${result.error?.message || 'Unknown error'}`);
        }

        // Store results in context
        ctx.buildResult = result;
    }
}
