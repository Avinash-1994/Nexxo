import { ProjectProfile } from '../schema.js';
import fs from 'fs/promises';
import path from 'path';

export class Analyzer {
    constructor(private root: string) { }

    async analyze(): Promise<ProjectProfile> {
        const pkgPath = path.join(this.root, 'package.json');
        let pkg: any = {};

        try {
            const content = await fs.readFile(pkgPath, 'utf-8');
            pkg = JSON.parse(content);
        } catch (e) {
            // Ignore missing package.json
        }

        return {
            framework: this.detectFramework(pkg),
            language: await this.detectLanguage(),
            packageManager: await this.detectPackageManager(),
            dependencies: pkg.dependencies || {},
            devDependencies: pkg.devDependencies || {},
            configSummary: {} // TODO: Parse nextgen.config.ts
        };
    }

    private detectFramework(pkg: any): string {
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['react']) return 'react';
        if (deps['vue']) return 'vue';
        if (deps['svelte']) return 'svelte';
        if (deps['@angular/core']) return 'angular';
        return 'unknown';
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
}
