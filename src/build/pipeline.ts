
import * as fs from 'fs';
import * as path from 'path';
import { build } from 'esbuild';

/**
 * Lunx Multi-Target Build Pipeline
 * Handles SPA, SSR, SSG, Edge, and Lib modes
 * Day 28: Multi-Target Pipeline & Production Lock
 */

export type BuildTarget = 'spa' | 'ssr' | 'ssg' | 'edge' | 'lib';

export interface BuildOptions {
    target: BuildTarget[];
    outDir: string;
    minify: boolean;
    ssr: boolean;
    edge: boolean;
    entry?: string;
}

export class BuildPipeline {
    constructor(private options: BuildOptions) { }

    /**
     * Main Build Entry
     */
    async build() {
        console.log(`🚀 Starting Lunx Multi-Target Build...`);
        console.log(`Targets: ${this.options.target.join(', ')}`);

        fs.mkdirSync(this.options.outDir, { recursive: true });

        for (const target of this.options.target) {
            await this.buildTarget(target);
        }

        console.log(`✨ Build Complete!`);
    }

    private async buildTarget(target: BuildTarget) {
        console.log(`  📦 Building for ${target}...`);

        switch (target) {
            case 'spa':
                await this.buildSPA();
                break;
            case 'ssr':
                await this.buildSSR();
                break;
            case 'edge':
                await this.buildEdge();
                break;
            case 'ssg':
                await this.buildSSG();
                break;
            case 'lib':
                await this.buildLib();
                break;
        }
    }

    private async resolveEntry() {
        const entry = this.options.entry;
        if (entry && fs.existsSync(entry)) {
            return path.resolve(entry);
        }

        const candidates = [
            'src/main.ts',
            'src/main.tsx',
            'src/index.ts',
            'src/index.tsx',
            'src/main.js',
            'src/index.js'
        ];

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return path.resolve(candidate);
            }
        }

        return undefined;
    }

    private async resolveEntryOrThrow() {
        const entry = await this.resolveEntry();
        if (!entry) {
            throw new Error(
                'Build entry file not found. Create one of src/main.ts, src/main.tsx, src/index.ts, src/index.tsx, src/main.js, src/index.js, or set the entry option explicitly.'
            );
        }
        return entry;
    }

    private async buildSPA() {
        const outDir = path.join(this.options.outDir, 'browser');
        fs.mkdirSync(outDir, { recursive: true });

        const entry = await this.resolveEntryOrThrow();

        const outfile = path.join(outDir, 'app.js');
        await build({
            entryPoints: [entry],
            bundle: true,
            minify: this.options.minify,
            sourcemap: true,
            platform: 'browser',
            format: 'esm',
            outfile,
            write: true,
        });

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Lunx SPA</title></head><body><div id="app"></div><script type="module" src="./app.js"></script></body></html>`;
        fs.writeFileSync(path.join(outDir, 'index.html'), html);
        console.log(`    ✅ SPA Bundle and HTML emitted to ${outDir}`);
    }

    private async buildSSR() {
        const outDir = path.join(this.options.outDir, 'server');
        fs.mkdirSync(outDir, { recursive: true });

        const entry = await this.resolveEntryOrThrow();

        await build({
            entryPoints: [entry],
            bundle: true,
            minify: this.options.minify,
            sourcemap: false,
            platform: 'node',
            target: 'node20',
            format: 'cjs',
            outfile: path.join(outDir, 'server.js'),
            write: true,
        });
        console.log(`    ✅ SSR Server Bundle emitted to ${outDir}`);
    }

    private async buildEdge() {
        const outDir = path.join(this.options.outDir, 'edge');
        fs.mkdirSync(outDir, { recursive: true });

        const entry = await this.resolveEntryOrThrow();

        await build({
            entryPoints: [entry],
            bundle: true,
            minify: this.options.minify,
            sourcemap: false,
            platform: 'neutral',
            format: 'esm',
            outfile: path.join(outDir, 'handler.js'),
            write: true,
        });
        console.log(`    ✅ Edge Bundle emitted to ${outDir}`);
    }

    private async buildSSG() {
        const outDir = path.join(this.options.outDir, 'static');
        fs.mkdirSync(outDir, { recursive: true });

        const entry = await this.resolveEntryOrThrow();

        const jsOut = path.join(outDir, 'app.js');
        await build({
            entryPoints: [entry],
            bundle: true,
            minify: this.options.minify,
            sourcemap: false,
            platform: 'browser',
            format: 'esm',
            outfile: jsOut,
            write: true,
        });

        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Lunx SSG</title></head><body><div id="app"></div><script type="module" src="./app.js"></script></body></html>`;
        fs.writeFileSync(path.join(outDir, 'index.html'), html);
        console.log(`    ✅ Static site emitted to ${outDir}`);
    }

    private async buildLib() {
        const outDir = path.join(this.options.outDir, 'dist');
        fs.mkdirSync(outDir, { recursive: true });

        const entry = await this.resolveEntryOrThrow();

        await build({
            entryPoints: [entry],
            bundle: true,
            minify: this.options.minify,
            sourcemap: false,
            platform: 'neutral',
            format: 'esm',
            outfile: path.join(outDir, 'index.js'),
            write: true,
        });
        fs.writeFileSync(path.join(outDir, 'index.d.ts'), `export * from './${path.basename(entry)}';`);
        console.log(`    ✅ Library bundle emitted to ${outDir}`);
    }

    /**
     * Incremental Build Check
     */
    checkDelta(file: string): boolean {
        return true;
    }
}
