/**
 * @urja/preset-core
 * 
 * Opinionated defaults for 80% of applications.
 * Zero-config experience with smart auto-detection.
 * 
 * Philosophy:
 * - Convention over configuration
 * - Auto-detect framework from package.json
 * - Smart defaults that "just work"
 * - Easy to override when needed
 */

import fs from 'fs';
import path from 'path';
import { BuildConfig } from '../config/index.js';

export interface CorePresetOptions {
    /**
     * Auto-detect framework from package.json dependencies
     * @default true
     */
    autoDetectFramework?: boolean;

    /**
     * Auto-detect entry points from common locations
     * @default true
     */
    autoDetectEntry?: boolean;

    /**
     * Auto-enable HMR in development
     * @default true
     */
    autoEnableHMR?: boolean;

    /**
     * Auto-configure CSS handling
     * @default true
     */
    autoConfigureCSS?: boolean;

    /**
     * Auto-configure asset handling
     * @default true
     */
    autoConfigureAssets?: boolean;

    /**
     * Port selection strategy
     * @default 'auto' - Try 5173, fallback to next available
     */
    portStrategy?: 'auto' | 'fixed' | number;

    /**
     * Output directory
     * @default 'dist'
     */
    outDir?: string;

    /**
     * Public directory for static assets
     * @default 'public'
     */
    publicDir?: string;

    /**
     * Source directory
     * @default 'src'
     */
    srcDir?: string;
}

export interface FrameworkDetectionResult {
    framework: string | null;
    version: string | null;
    confidence: 'high' | 'medium' | 'low';
    source: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'manual';
}

/**
 * Core preset implementation
 */
export class CorePreset {
    private options: Required<CorePresetOptions>;
    private cwd: string;

    constructor(cwd: string, options: CorePresetOptions = {}) {
        this.cwd = cwd;
        this.options = {
            autoDetectFramework: options.autoDetectFramework ?? true,
            autoDetectEntry: options.autoDetectEntry ?? true,
            autoEnableHMR: options.autoEnableHMR ?? true,
            autoConfigureCSS: options.autoConfigureCSS ?? true,
            autoConfigureAssets: options.autoConfigureAssets ?? true,
            portStrategy: options.portStrategy ?? 'auto',
            outDir: options.outDir ?? 'dist',
            publicDir: options.publicDir ?? 'public',
            srcDir: options.srcDir ?? 'src'
        };
    }

    /**
     * Apply core preset to build config
     */
    apply(config: Partial<BuildConfig> = {}): Partial<BuildConfig> {
        const preset: Partial<BuildConfig> = { ...config };

        // 1. Auto-detect framework
        if (this.options.autoDetectFramework && !config.plugins) {
            const detection = this.detectFramework();
            if (detection.framework) {
                console.log(`🔍 Auto-detected framework: ${detection.framework} (${detection.confidence} confidence)`);
                // Framework plugins would be loaded here
            }
        }

        // 2. Auto-detect entry points
        if (this.options.autoDetectEntry && !config.entry) {
            preset.entry = this.detectEntryPoints();
            console.log(`🔍 Auto-detected entry: ${preset.entry.join(', ')}`);
        }

        // 3. Auto-configure port
        if (!config.port) {
            preset.port = this.selectPort();
        }

        // 4. Auto-configure directories
        if (!config.outDir) {
            preset.outDir = this.options.outDir;
        }

        // 5. Auto-enable HMR in development
        if (this.options.autoEnableHMR && config.mode === 'development') {
            // HMR is enabled by default in dev server
        }

        // 6. Auto-configure CSS
        if (this.options.autoConfigureCSS && !config.css) {
            preset.css = this.detectCSSFramework();
        }

        // 7. Set smart defaults
        preset.root = preset.root || this.cwd;
        preset.mode = preset.mode || 'development';
        preset.platform = preset.platform || 'browser';
        preset.preset = preset.preset || 'spa';

        return preset;
    }

    /**
     * Detect framework from package.json
     */
    private detectFramework(): FrameworkDetectionResult {
        const pkgPath = path.join(this.cwd, 'package.json');

        if (!fs.existsSync(pkgPath)) {
            return {
                framework: null,
                version: null,
                confidence: 'low',
                source: 'manual'
            };
        }

        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
            ...pkg.peerDependencies
        };

        // Framework detection priority (most specific first)
        const frameworkPatterns = [
            { name: 'react', packages: ['react', 'react-dom'], confidence: 'high' as const },
            { name: 'vue', packages: ['vue'], confidence: 'high' as const },
            { name: 'svelte', packages: ['svelte'], confidence: 'high' as const },
            { name: 'solid-js', packages: ['solid-js'], confidence: 'high' as const },
            { name: 'lit', packages: ['lit'], confidence: 'high' as const },
            { name: 'preact', packages: ['preact'], confidence: 'high' as const },
            { name: 'alpine', packages: ['alpinejs'], confidence: 'high' as const },
            { name: 'mithril', packages: ['mithril'], confidence: 'high' as const },
            { name: 'angular', packages: ['@angular/core'], confidence: 'high' as const },
            { name: 'qwik', packages: ['@builder.io/qwik'], confidence: 'high' as const },
            { name: 'astro', packages: ['astro'], confidence: 'high' as const },
        ];

        for (const pattern of frameworkPatterns) {
            for (const pkgName of pattern.packages) {
                if (allDeps[pkgName]) {
                    const source =
                        pkgName in (pkg.dependencies || {}) ? 'dependencies' :
                            pkgName in (pkg.devDependencies || {}) ? 'devDependencies' :
                                'peerDependencies';

                    return {
                        framework: pattern.name,
                        version: allDeps[pkgName],
                        confidence: pattern.confidence,
                        source: source as any
                    };
                }
            }
        }

        return {
            framework: null,
            version: null,
            confidence: 'low',
            source: 'manual'
        };
    }

    /**
     * Detect entry points from common locations
     */
    private detectEntryPoints(): string[] {
        const candidates = [
            // TypeScript + JSX
            'src/main.tsx',
            'src/index.tsx',
            'src/app.tsx',

            // TypeScript
            'src/main.ts',
            'src/index.ts',
            'src/app.ts',

            // JavaScript + JSX
            'src/main.jsx',
            'src/index.jsx',
            'src/app.jsx',

            // JavaScript
            'src/main.js',
            'src/index.js',
            'src/app.js',

            // Root level
            'index.tsx',
            'index.ts',
            'index.jsx',
            'index.js',
            'main.tsx',
            'main.ts',
            'main.jsx',
            'main.js',
        ];

        for (const candidate of candidates) {
            const fullPath = path.join(this.cwd, candidate);
            if (fs.existsSync(fullPath)) {
                return [candidate];
            }
        }

        // Fallback to default
        return ['src/main.tsx'];
    }

    /**
     * Select port based on strategy
     */
    private selectPort(): number {
        if (typeof this.options.portStrategy === 'number') {
            return this.options.portStrategy;
        }

        if (this.options.portStrategy === 'fixed') {
            return 5173;
        }

        // Auto strategy: Try 5173, then find next available
        // For now, just return 5173 (actual port checking would be in dev server)
        return 5173;
    }

    /**
     * Detect CSS framework from package.json
     */
    private detectCSSFramework(): BuildConfig['css'] {
        const pkgPath = path.join(this.cwd, 'package.json');

        if (!fs.existsSync(pkgPath)) {
            return { framework: 'none' };
        }

        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies
        };

        // Detect CSS framework
        if (allDeps['tailwindcss']) {
            console.log('🔍 Auto-detected CSS framework: Tailwind CSS');
            return { framework: 'tailwind', purge: true };
        }

        if (allDeps['bootstrap']) {
            console.log('🔍 Auto-detected CSS framework: Bootstrap');
            return { framework: 'bootstrap' };
        }

        if (allDeps['bulma']) {
            console.log('🔍 Auto-detected CSS framework: Bulma');
            return { framework: 'bulma' };
        }

        if (allDeps['@mui/material'] || allDeps['@material-ui/core']) {
            console.log('🔍 Auto-detected CSS framework: Material UI');
            return { framework: 'material' };
        }

        return { framework: 'none' };
    }

    /**
     * Get preset info for diagnostics
     */
    getInfo(): {
        framework: FrameworkDetectionResult;
        entry: string[];
        port: number;
        css: BuildConfig['css'];
    } {
        return {
            framework: this.detectFramework(),
            entry: this.detectEntryPoints(),
            port: this.selectPort(),
            css: this.detectCSSFramework()
        };
    }
}

/**
 * Factory function for easy usage
 */
export function corePreset(options: CorePresetOptions = {}) {
    return (cwd: string) => {
        const preset = new CorePreset(cwd, options);
        return preset;
    };
}

/**
 * Default export
 */
export default corePreset;
