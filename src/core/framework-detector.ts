/**
 * Framework Detector
 * Automatically detects which framework(s) are being used in the project
 */

import fs from 'fs/promises';
import path from 'path';

export type Framework =
    | 'react'
    | 'vue'
    | 'svelte'
    | 'angular'
    | 'solid'
    | 'preact'
    | 'qwik'
    | 'lit'
    | 'astro'
    | 'next'
    | 'nuxt'
    | 'remix'
    | 'vanilla';

export interface FrameworkInfo {
    name: Framework;
    version?: string;
    detected: boolean;
    confidence: number; // 0-1
}

export class FrameworkDetector {
    private root: string;
    private packageJson: any;

    constructor(root: string) {
        this.root = root;
    }

    async detect(): Promise<FrameworkInfo[]> {
        // Read package.json
        try {
            const pkgPath = path.join(this.root, 'package.json');
            const content = await fs.readFile(pkgPath, 'utf-8');
            this.packageJson = JSON.parse(content);
        } catch (error) {
            return [{ name: 'vanilla', detected: true, confidence: 1.0 }];
        }

        const frameworks: FrameworkInfo[] = [];
        const deps = {
            ...this.packageJson.dependencies,
            ...this.packageJson.devDependencies
        };

        // Detect frameworks based on dependencies
        // Meta-frameworks first (they include their base framework)
        if (deps['next']) {
            frameworks.push({
                name: 'next',
                version: deps['next'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['nuxt']) {
            frameworks.push({
                name: 'nuxt',
                version: deps['nuxt'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['@remix-run/react']) {
            frameworks.push({
                name: 'remix',
                version: deps['@remix-run/react'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['astro']) {
            frameworks.push({
                name: 'astro',
                version: deps['astro'],
                detected: true,
                confidence: 1.0
            });
        }

        // Base frameworks
        if (deps['react'] && !frameworks.some(f => f.name === 'next' || f.name === 'remix')) {
            frameworks.push({
                name: 'react',
                version: deps['react'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['vue'] && !frameworks.some(f => f.name === 'nuxt')) {
            frameworks.push({
                name: 'vue',
                version: deps['vue'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['svelte']) {
            frameworks.push({
                name: 'svelte',
                version: deps['svelte'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['@angular/core']) {
            frameworks.push({
                name: 'angular',
                version: deps['@angular/core'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['solid-js']) {
            frameworks.push({
                name: 'solid',
                version: deps['solid-js'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['preact']) {
            frameworks.push({
                name: 'preact',
                version: deps['preact'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['qwik'] || deps['@builder.io/qwik']) {
            frameworks.push({
                name: 'qwik',
                version: deps['qwik'] || deps['@builder.io/qwik'],
                detected: true,
                confidence: 1.0
            });
        }

        if (deps['lit']) {
            frameworks.push({
                name: 'lit',
                version: deps['lit'],
                detected: true,
                confidence: 1.0
            });
        }

        // If no framework detected, it's vanilla JS/TS
        if (frameworks.length === 0) {
            frameworks.push({
                name: 'vanilla',
                detected: true,
                confidence: 1.0
            });
        }

        return frameworks;
    }

    async detectPrimary(): Promise<Framework> {
        const frameworks = await this.detect();
        // Return the first detected framework (highest priority)
        return frameworks[0]?.name || 'vanilla';
    }

    async getFrameworkVersion(framework: Framework): Promise<string | undefined> {
        const frameworks = await this.detect();
        return frameworks.find(f => f.name === framework)?.version;
    }
}
