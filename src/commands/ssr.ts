/**
 * SSR Server CLI Command Handler
 */

import { SSRServer } from '../meta-frameworks/ssr/server.js';
import { loadConfig } from '../config/index.js';
import { log } from '../utils/logger.js';

export interface SSRCommandArgs {
    port: number;
    framework: 'nextjs' | 'nuxt' | 'remix';
    prod: boolean;
}

/**
 * Handle SSR command from CLI
 */
export async function handleSSRCommand(args: SSRCommandArgs) {
    try {
        log.info('🚀 Starting SSR Server...');

        // Load config
        const config = await loadConfig(process.cwd());

        // Create SSR server
        const server = new SSRServer({
            root: config.root || process.cwd(),
            framework: args.framework,
            outDir: config.outDir || 'dist',
            port: args.port,
            production: args.prod || false,
        });

        // Start server
        await server.start();
    } catch (error: any) {
        log.error(`❌ SSR Server failed: ${error.message}`);
        process.exit(1);
    }
}
