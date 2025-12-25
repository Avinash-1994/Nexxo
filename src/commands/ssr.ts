/**
 * SSR Server CLI Command
 * Start server-side rendering server
 */

import { Command } from 'commander';
import { SSRServer } from '../meta-frameworks/ssr/server.js';
import { loadConfig } from '../config/index.js';
import { log } from '../utils/logger.js';

export function createSSRCommand(): Command {
    const command = new Command('ssr');

    command
        .description('Start SSR server for meta-frameworks')
        .option('-p, --port <port>', 'Server port', '3000')
        .option('-f, --framework <framework>', 'Framework type (nextjs|nuxt|remix)', 'nextjs')
        .option('--prod', 'Production mode')
        .action(async (options) => {
            try {
                log.info('🚀 Starting SSR Server...');

                // Load config
                const config = await loadConfig(process.cwd());

                // Create SSR server
                const server = new SSRServer({
                    root: config.root || process.cwd(),
                    framework: options.framework,
                    outDir: config.outDir || 'dist',
                    port: parseInt(options.port),
                    production: options.prod || false,
                });

                // Start server
                await server.start();
            } catch (error: any) {
                log.error(`❌ SSR Server failed: ${error.message}`);
                process.exit(1);
            }
        });

    return command;
}
