import fs from 'fs/promises';
import path from 'path';
import { log } from '../utils/logger.js';

export type FrameworkName = 'react' | 'vue' | 'svelte' | 'preact' | 'solid' | 'angular' | 'vanilla';

export interface DetectedFramework {
    name: FrameworkName | string;
    version?: string;
    isSSR?: boolean;
}

export type FrameworkDetector = (root: string) => Promise<DetectedFramework | null>;

const customDetectors: FrameworkDetector[] = [];

export function registerFrameworkDetector(detector: FrameworkDetector) {
    customDetectors.push(detector);
}

export async function detectFramework(root: string): Promise<DetectedFramework | null> {
    try {
        // Try custom detectors first
        for (const detector of customDetectors) {
            const result = await detector(root);
            if (result) return result;
        }

        const pkgPath = path.join(root, 'package.json');
        const pkgExists = await fs.access(pkgPath).then(() => true).catch(() => false);

        if (pkgExists) {
            const pkgContent = await fs.readFile(pkgPath, 'utf-8');
            const pkg = JSON.parse(pkgContent);
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (deps['@angular/core']) return { name: 'angular', version: deps['@angular/core'] };
            if (deps['svelte']) return { name: 'svelte', version: deps['svelte'] };
            if (deps['vue']) return { name: 'vue', version: deps['vue'] };
            if (deps['react']) return { name: 'react', version: deps['react'] };
            if (deps['preact']) return { name: 'preact', version: deps['preact'] };
            if (deps['solid-js']) return { name: 'solid', version: deps['solid-js'] };
        }

        // Fallback: Scan src files if package.json is ambiguous or missing
        // This is a basic heuristic scan
        const srcPath = path.join(root, 'src');
        const srcExists = await fs.access(srcPath).then(() => true).catch(() => false);

        if (srcExists) {
            const files = await fs.readdir(srcPath);
            for (const file of files) {
                if (file.endsWith('.svelte')) return { name: 'svelte' };
                if (file.endsWith('.vue')) return { name: 'vue' };
                if (file.endsWith('.tsx')) {
                    // Could be React, Solid, or Preact. Defaulting to React for now if no package.json hints
                    // In a real scenario, we'd read the file imports.
                    return { name: 'react' };
                }
            }
        }

        return { name: 'vanilla' };

    } catch (error) {
        log.warn('Failed to detect framework', { error });
        return null;
    }
}
