/**
 * Migration Analyzer (Day 43)
 * 
 * Analyzes existing projects (Vite/Webpack/Rollup/Angular CLI) and generates
 * a migration plan for converting to Nexxo.
 */

import fs from 'fs';
import path from 'path';

export type ToolchainType = 'vite' | 'webpack' | 'rollup' | 'angular-cli' | 'unknown';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type Framework = 'react' | 'vue' | 'svelte' | 'angular' | 'solid' | 'preact' | 'lit' | 'qwik' | 'unknown';

export interface MigrationPlan {
    toolchainType: ToolchainType;
    frameworks: Framework[];
    plugins: string[];
    loaders: string[];
    riskLevel: RiskLevel;
    autoMigrate: string[];
    manualSteps: string[];
    cssSetup: {
        hasTailwind: boolean;
        hasSass: boolean;
        hasCSSModules: boolean;
        hasCSSInJS: boolean;
        cssInJSLibrary?: string;
    };
    projectStructure: {
        isMonorepo: boolean;
        hasWorkspaces: boolean;
        entryPoints: string[];
    };
}

export class MigrationAnalyzer {
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = path.resolve(projectRoot);
    }

    async analyze(): Promise<MigrationPlan> {
        const packageJson = this.readPackageJson();
        const toolchain = this.detectToolchain();
        const frameworks = this.detectFrameworks(packageJson);
        const cssSetup = this.analyzeCSSSetup(packageJson);
        const projectStructure = this.analyzeProjectStructure(packageJson);
        const { plugins, loaders } = this.detectPluginsAndLoaders(toolchain, packageJson);

        const plan: MigrationPlan = {
            toolchainType: toolchain,
            frameworks,
            plugins,
            loaders,
            riskLevel: this.calculateRiskLevel(toolchain, plugins, loaders),
            autoMigrate: this.determineAutoMigrate(toolchain, frameworks, plugins),
            manualSteps: this.determineManualSteps(toolchain, plugins, loaders),
            cssSetup,
            projectStructure
        };

        return plan;
    }

    private readPackageJson(): any {
        const pkgPath = path.join(this.projectRoot, 'package.json');
        if (!fs.existsSync(pkgPath)) {
            throw new Error(`package.json not found in ${this.projectRoot}`);
        }
        return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    }

    private detectToolchain(): ToolchainType {
        // Check for config files in order of specificity
        const configChecks = [
            { pattern: /^vite\.config\.(js|ts|mjs|cjs|mts|cts)$/, type: 'vite' as ToolchainType },
            { pattern: /^webpack\.config\.(js|ts|mjs|cjs)$/, type: 'webpack' as ToolchainType },
            { pattern: /^rollup\.config\.(js|ts|mjs|cjs)$/, type: 'rollup' as ToolchainType },
            { pattern: /^angular\.json$/, type: 'angular-cli' as ToolchainType }
        ];

        const files = fs.readdirSync(this.projectRoot);

        for (const check of configChecks) {
            if (files.some(f => check.pattern.test(f))) {
                return check.type;
            }
        }

        return 'unknown';
    }

    private detectFrameworks(packageJson: any): Framework[] {
        const deps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        const frameworks: Framework[] = [];
        const frameworkMap: Record<string, Framework> = {
            'react': 'react',
            'react-dom': 'react',
            'vue': 'vue',
            'svelte': 'svelte',
            '@angular/core': 'angular',
            'solid-js': 'solid',
            'preact': 'preact',
            'lit': 'lit',
            '@builder.io/qwik': 'qwik'
        };

        for (const [dep, framework] of Object.entries(frameworkMap)) {
            if (deps[dep] && !frameworks.includes(framework)) {
                frameworks.push(framework);
            }
        }

        return frameworks.length > 0 ? frameworks : ['unknown'];
    }

    private analyzeCSSSetup(packageJson: any): MigrationPlan['cssSetup'] {
        const deps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        const hasTailwind = 'tailwindcss' in deps || fs.existsSync(path.join(this.projectRoot, 'tailwind.config.js')) || fs.existsSync(path.join(this.projectRoot, 'tailwind.config.ts'));
        const hasSass = 'sass' in deps || 'node-sass' in deps;
        const hasCSSModules = this.checkForCSSModules();

        let hasCSSInJS = false;
        let cssInJSLibrary: string | undefined;

        const cssInJSLibs = ['styled-components', '@emotion/react', '@emotion/styled', 'styled-jsx', '@mui/material'];
        for (const lib of cssInJSLibs) {
            if (lib in deps) {
                hasCSSInJS = true;
                cssInJSLibrary = lib;
                break;
            }
        }

        return {
            hasTailwind,
            hasSass,
            hasCSSModules,
            hasCSSInJS,
            cssInJSLibrary
        };
    }

    private checkForCSSModules(): boolean {
        // Check for .module.css files in src/
        const srcDir = path.join(this.projectRoot, 'src');
        if (!fs.existsSync(srcDir)) return false;

        const hasModuleCSS = (dir: string): boolean => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    if (hasModuleCSS(fullPath)) return true;
                } else if (file.endsWith('.module.css') || file.endsWith('.module.scss')) {
                    return true;
                }
            }
            return false;
        };

        return hasModuleCSS(srcDir);
    }

    private analyzeProjectStructure(packageJson: any): MigrationPlan['projectStructure'] {
        const isMonorepo = 'workspaces' in packageJson || fs.existsSync(path.join(this.projectRoot, 'pnpm-workspace.yaml')) || fs.existsSync(path.join(this.projectRoot, 'lerna.json'));
        const hasWorkspaces = 'workspaces' in packageJson;

        const entryPoints: string[] = [];

        // Common entry point patterns
        const commonEntries = [
            'src/main.ts',
            'src/main.tsx',
            'src/main.js',
            'src/main.jsx',
            'src/index.ts',
            'src/index.tsx',
            'src/index.js',
            'src/index.jsx',
            'index.html'
        ];

        for (const entry of commonEntries) {
            if (fs.existsSync(path.join(this.projectRoot, entry))) {
                entryPoints.push(entry);
            }
        }

        return {
            isMonorepo,
            hasWorkspaces,
            entryPoints
        };
    }

    private detectPluginsAndLoaders(toolchain: ToolchainType, packageJson: any): { plugins: string[], loaders: string[] } {
        const deps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        const plugins: string[] = [];
        const loaders: string[] = [];

        // Vite plugins
        if (toolchain === 'vite') {
            const vitePlugins = Object.keys(deps).filter(d => d.startsWith('@vitejs/plugin-') || d.startsWith('vite-plugin-'));
            plugins.push(...vitePlugins);
        }

        // Webpack loaders
        if (toolchain === 'webpack') {
            const webpackLoaders = Object.keys(deps).filter(d => d.endsWith('-loader'));
            loaders.push(...webpackLoaders);

            const webpackPlugins = Object.keys(deps).filter(d => d.includes('webpack-plugin') || d.includes('webpack') && d !== 'webpack');
            plugins.push(...webpackPlugins);
        }

        // Rollup plugins
        if (toolchain === 'rollup') {
            const rollupPlugins = Object.keys(deps).filter(d => d.startsWith('@rollup/plugin-') || d.startsWith('rollup-plugin-'));
            plugins.push(...rollupPlugins);
        }

        return { plugins, loaders };
    }

    private calculateRiskLevel(toolchain: ToolchainType, plugins: string[], loaders: string[]): RiskLevel {
        if (toolchain === 'unknown') return 'HIGH';

        const totalCustomizations = plugins.length + loaders.length;

        if (totalCustomizations === 0) return 'LOW';
        if (totalCustomizations <= 5) return 'LOW';
        if (totalCustomizations <= 15) return 'MEDIUM';
        return 'HIGH';
    }

    private determineAutoMigrate(toolchain: ToolchainType, frameworks: Framework[], plugins: string[]): string[] {
        const autoMigrate: string[] = [];

        // Framework detection
        if (frameworks.length > 0 && frameworks[0] !== 'unknown') {
            autoMigrate.push(`Framework detection: ${frameworks.join(', ')}`);
        }

        // Basic config migration
        if (toolchain !== 'unknown') {
            autoMigrate.push('Entry points configuration');
            autoMigrate.push('Output directory configuration');
            autoMigrate.push('Development server settings');
        }

        // Common plugins that have Nexxo equivalents
        const autoMigratablePlugins = [
            '@vitejs/plugin-react',
            '@vitejs/plugin-vue',
            'vite-plugin-svelte',
            'babel-loader',
            'ts-loader',
            'css-loader',
            'style-loader',
            'sass-loader'
        ];

        for (const plugin of plugins) {
            if (autoMigratablePlugins.includes(plugin)) {
                autoMigrate.push(`Plugin: ${plugin} → Nexxo preset`);
            }
        }

        return autoMigrate;
    }

    private determineManualSteps(toolchain: ToolchainType, plugins: string[], loaders: string[]): string[] {
        const manualSteps: string[] = [];

        if (toolchain === 'unknown') {
            manualSteps.push('Unable to detect build tool - manual configuration required');
            return manualSteps;
        }

        // Custom plugins that need manual review
        const customPlugins = plugins.filter(p =>
            !p.startsWith('@vitejs/plugin-') &&
            !p.startsWith('@rollup/plugin-') &&
            !p.endsWith('-loader')
        );

        if (customPlugins.length > 0) {
            manualSteps.push(`Review custom plugins: ${customPlugins.join(', ')}`);
        }

        // Complex loaders
        const complexLoaders = loaders.filter(l =>
            l.includes('file-loader') ||
            l.includes('url-loader') ||
            l.includes('worker-loader')
        );

        if (complexLoaders.length > 0) {
            manualSteps.push(`Migrate asset handling: ${complexLoaders.join(', ')}`);
        }

        // Environment variables
        manualSteps.push('Review environment variable usage (process.env → import.meta.env)');

        // Build scripts
        manualSteps.push('Update package.json scripts to use Nexxo commands');

        return manualSteps;
    }
}

// CLI helper
export async function analyzeMigration(projectPath: string): Promise<MigrationPlan> {
    const analyzer = new MigrationAnalyzer(projectPath);
    return await analyzer.analyze();
}
