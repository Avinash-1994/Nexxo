import { ProjectProfile } from '../schema.js';
import fs from 'fs/promises';
import path from 'path';

export class ProjectProfiler {
    constructor(private root: string) { }

    async profile(): Promise<ProjectProfile> {
        const pkgPath = path.join(this.root, 'package.json');
        let pkg: any = {};

        try {
            const content = await fs.readFile(pkgPath, 'utf-8');
            pkg = JSON.parse(content);
        } catch (e) {
            // Ignore missing package.json
        }

        const framework = this.detectFramework(pkg);
        const cssFramework = this.detectCssFramework(pkg);
        const language = await this.detectLanguage();
        const packageManager = await this.detectPackageManager();

        return {
            framework,
            cssFramework,
            language,
            packageManager,
            dependencies: pkg.dependencies || {},
            devDependencies: pkg.devDependencies || {},
            configSummary: {}, // TODO: Parse nextgen.config.ts
            entries: await this.detectEntries(),
            size: {
                totalJs: 0, // Placeholder: would need actual build stats
                vendorChunk: 0
            },
            cache: {
                hitRate: 0 // Placeholder
            },
            warnings: []
        };
    }

    private detectFramework(pkg: any): string {
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['react']) return 'react';
        if (deps['vue']) return 'vue';
        if (deps['svelte']) return 'svelte';
        if (deps['@angular/core']) return 'angular';
        if (deps['solid-js']) return 'solid';
        if (deps['preact']) return 'preact';
        return 'unknown';
    }

    private detectCssFramework(pkg: any): string | undefined {
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['tailwindcss']) return 'tailwind';
        if (deps['bootstrap']) return 'bootstrap';
        if (deps['bulma']) return 'bulma';
        if (deps['@mui/material']) return 'material';
        return undefined;
    }

    private async detectLanguage(): Promise<'typescript' | 'javascript'> {
        try {
            await fs.access(path.join(this.root, 'tsconfig.json'));
            return 'typescript';
        } catch {
            return 'javascript';
        }
    }

    private async detectPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
        try { await fs.access(path.join(this.root, 'yarn.lock')); return 'yarn'; } catch { }
        try { await fs.access(path.join(this.root, 'pnpm-lock.yaml')); return 'pnpm'; } catch { }
        try { await fs.access(path.join(this.root, 'bun.lockb')); return 'bun'; } catch { }
        return 'npm';
    }

    private async detectEntries(): Promise<string[]> {
        // Simple heuristic for now
        const candidates = [
            'src/main.tsx', 'src/main.ts', 'src/index.tsx', 'src/index.ts',
            'src/App.tsx', 'src/App.vue', 'src/main.js', 'src/index.js'
        ];
        const found: string[] = [];
        for (const c of candidates) {
            try {
                await fs.access(path.join(this.root, c));
                found.push(c);
            } catch { }
        }
        return found;
    }
}
