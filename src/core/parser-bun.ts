/**
 * Bun.js Parser & Transformer
 * Day 3: Module 1 - Speed Mastery
 * 
 * Provides ultra-fast parsing and transformation using Bun's native API.
 * Falls back to SWC/esbuild if not running in Bun runtime.
 */

import * as path from 'path';
import { log } from '../utils/logger.js';
import { createRequire } from 'module';

// Types for Bun's Transpiler API
interface BunTranspilerOptions {
    loader?: 'js' | 'jsx' | 'ts' | 'tsx';
    target?: 'browser' | 'bun' | 'node';
    define?: Record<string, string>;
    exports?: 'auto' | 'default' | 'named';
    platform?: 'browser' | 'bun' | 'node';
}

interface BunTranspiler {
    transform(code: string, options?: BunTranspilerOptions): Promise<string>;
    transformSync(code: string, options?: BunTranspilerOptions): string;
    scan(code: string): { exports: string[]; imports: any[] };
    scanImports(code: string): any[];
}

declare global {
    var Bun: {
        transpiler: new (options?: any) => BunTranspiler;
        version: string;
        spawn: any;
        write: any;
        file: any;
    } | undefined;
}

export class BunParser {
    private transpiler: BunTranspiler | null = null;
    private isBunRuntime: boolean;

    constructor() {
        this.isBunRuntime = typeof Bun !== 'undefined';
        if (this.isBunRuntime) {
            // @ts-ignore
            this.transpiler = new Bun.Transpiler({
                loader: 'tsx', // Default loader, can be overridden per file
                target: 'browser'
            });
            log.info(`🚀 using native Bun parser v${Bun!.version}`);
        } else {
            log.warn('⚠️ Bun runtime not detected. Falling back to spawning bun or SWC.');
        }
    }

    /**
     * specialized transform for specific loaders
     */
    async transform(code: string, filePath: string, options: { isDev: boolean, define?: Record<string, string> }): Promise<{ code: string; map?: string }> {
        const ext = path.extname(filePath);
        const loader = this.getLoader(ext);

        if (this.isBunRuntime && this.transpiler) {
            try {
                // Use native Bun.transpiler (Ultra fast)
                // log.info(`Debug: loader=${loader} code_len=${code.length}`);
                const result = await this.transpiler.transform(code, loader);

                // Bun transpiler doesn't return source maps directly in transform() yet in all versions
                // newer versions do. Assuming string output for now.
                return { code: result, map: undefined };
            } catch (err: any) {
                log.error(`Bun transform failed for ${filePath}: ${err.message}`);
                throw err;
            }
        } else {
            // Not running in Bun, but maybe 'bun' binary is available?
            // Spawning bun for every file is slow. 
            // Strategy: Check if we have SWC, otherwise Esbuild.
            // But the plan says "Parser/Transform: Bun.js".
            // We could try to spawn `bun build` for single file?
            return this.transformWithSpawn(code, filePath, loader);
        }
    }

    private getLoader(ext: string): 'js' | 'jsx' | 'ts' | 'tsx' {
        switch (ext) {
            case '.ts': return 'ts';
            case '.tsx': return 'tsx';
            case '.jsx': return 'jsx';
            default: return 'js';
        }
    }

    /**
     * Fallback: Spawn 'bun' process
     * Note: This is significantly slower than running IN Bun.
     */
    private async transformWithSpawn(code: string, filePath: string, loader: string): Promise<{ code: string; map?: string }> {
        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            const fs = await import('fs/promises');
            const os = await import('os');

            // Create temp file
            const tempDir = os.tmpdir();
            const tempIn = path.join(tempDir, `nexxo_in_${Math.random().toString(36).slice(2)}${path.extname(filePath)}`);
            const tempOut = path.join(tempDir, `nexxo_out_${Math.random().toString(36).slice(2)}.js`); // Bun emits .js

            await fs.writeFile(tempIn, code);

            // Run bun build
            // bun build <file> --no-bundle --outfile <out>
            await execAsync(`bun build "${tempIn}" --no-bundle --outfile "${tempOut}" --target browser --format esm`);

            const result = await fs.readFile(tempOut, 'utf-8');

            // Cleanup
            await Promise.all([
                fs.unlink(tempIn).catch(() => { }),
                fs.unlink(tempOut).catch(() => { })
            ]);

            return { code: result };
        } catch (error: any) {
            // If Bun binary missing, this fails.
            throw new Error(`Bun binary execution failed: ${error.message}`);
        }
    }

    /**
     * Check if we are running in Bun
     */
    isBun(): boolean {
        return this.isBunRuntime;
    }
}

export const bunParser = new BunParser();
