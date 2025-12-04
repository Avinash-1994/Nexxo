/**
 * AI Analyzer - Project analysis and optimization suggestions
 * Simple rule-based system (can be upgraded to LLM later)
 */

import fs from 'fs/promises';
import path from 'path';

export interface ProjectAnalysis {
    framework: 'react' | 'vue' | 'svelte' | 'vanilla' | 'unknown';
    typescript: boolean;
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'unknown';
    dependencies: string[];
    fileCount: number;
    totalSize: number;
    entryPoints: string[];
}

export interface Suggestion {
    type: 'performance' | 'security' | 'dx' | 'best-practice';
    icon: string;
    title: string;
    description: string;
    action: string;
    priority: number;
}

/**
 * Analyze project structure and detect framework
 */
export async function analyzeProject(root: string): Promise<ProjectAnalysis> {
    const analysis: ProjectAnalysis = {
        framework: 'unknown',
        typescript: false,
        packageManager: 'npm',
        dependencies: [],
        fileCount: 0,
        totalSize: 0,
        entryPoints: []
    };

    try {
        // Check for package.json
        const packagePath = path.join(root, 'package.json');
        try {
            const packageData = await fs.readFile(packagePath, 'utf-8');
            const pkg = JSON.parse(packageData);

            // Detect framework
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            analysis.dependencies = Object.keys(deps);

            if (deps['react'] || deps['react-dom']) {
                analysis.framework = 'react';
            } else if (deps['vue']) {
                analysis.framework = 'vue';
            } else if (deps['svelte']) {
                analysis.framework = 'svelte';
            } else {
                analysis.framework = 'vanilla';
            }

            // Detect TypeScript
            analysis.typescript = !!(deps['typescript'] || deps['@types/node']);

        } catch (error) {
            // No package.json
        }

        // Detect package manager
        try {
            await fs.access(path.join(root, 'pnpm-lock.yaml'));
            analysis.packageManager = 'pnpm';
        } catch {
            try {
                await fs.access(path.join(root, 'yarn.lock'));
                analysis.packageManager = 'yarn';
            } catch {
                analysis.packageManager = 'npm';
            }
        }

        // Count files in src/
        try {
            const srcPath = path.join(root, 'src');
            const files = await getFiles(srcPath);
            analysis.fileCount = files.length;
            analysis.totalSize = await getTotalSize(files);

            // Find entry points
            const entryFiles = files.filter(f =>
                f.includes('main.') || f.includes('index.') || f.includes('app.')
            );
            analysis.entryPoints = entryFiles.map(f => path.relative(root, f));
        } catch (error) {
            // No src directory
        }

    } catch (error) {
        console.error('[ai] Analysis error:', error);
    }

    return analysis;
}

/**
 * Generate optimization suggestions based on project analysis
 */
export async function generateSuggestions(analysis: ProjectAnalysis): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    // Performance suggestions
    if (analysis.fileCount > 100) {
        suggestions.push({
            type: 'performance',
            icon: '⚡',
            title: 'Enable Code Splitting',
            description: 'Your project has ' + analysis.fileCount + ' files. Code splitting can reduce initial bundle size by up to 40%.',
            action: 'Enable',
            priority: 9
        });
    }

    if (analysis.fileCount > 50) {
        suggestions.push({
            type: 'performance',
            icon: '🚀',
            title: 'Use Native Worker',
            description: 'Switch to Rust native worker for ~20x faster plugin execution. Recommended for projects with 50+ files.',
            action: 'Enable',
            priority: 8
        });
    }

    // Framework-specific suggestions
    if (analysis.framework === 'react') {
        suggestions.push({
            type: 'dx',
            icon: '⚛️',
            title: 'React Fast Refresh',
            description: 'Enable React Fast Refresh for instant component updates without losing state.',
            action: 'Enable',
            priority: 7
        });
    }

    if (analysis.framework === 'vue') {
        suggestions.push({
            type: 'dx',
            icon: '💚',
            title: 'Vue SFC Plugin',
            description: 'Install Vue Single File Component plugin for better development experience.',
            action: 'Install',
            priority: 7
        });
    }

    // TypeScript suggestions
    if (analysis.typescript) {
        suggestions.push({
            type: 'best-practice',
            icon: '📘',
            title: 'TypeScript Config',
            description: 'Use nextgen.build.ts instead of JSON for type-safe configuration with IntelliSense.',
            action: 'Convert',
            priority: 6
        });
    }

    // Development suggestions
    suggestions.push({
        type: 'best-practice',
        icon: '🗺️',
        title: 'Source Maps',
        description: 'Enable source maps in development mode for better debugging experience.',
        action: 'Enable',
        priority: 5
    });

    suggestions.push({
        type: 'dx',
        icon: '🔥',
        title: 'Hot Module Replacement',
        description: 'HMR allows you to see changes instantly without full page reload.',
        action: 'Enable',
        priority: 7
    });

    // Security suggestions
    suggestions.push({
        type: 'security',
        icon: '🔒',
        title: 'Plugin Verification',
        description: 'Ensure all plugins are signed and verified before production deployment.',
        action: 'Review',
        priority: 8
    });

    // Sort by priority (highest first)
    return suggestions.sort((a, b) => b.priority - a.priority);
}

// ===== Helper Functions =====
async function getFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    const subFiles = await getFiles(fullPath);
                    files.push(...subFiles);
                }
            } else {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Directory doesn't exist or not accessible
    }

    return files;
}

async function getTotalSize(files: string[]): Promise<number> {
    let total = 0;

    for (const file of files) {
        try {
            const stats = await fs.stat(file);
            total += stats.size;
        } catch (error) {
            // File not accessible
        }
    }

    return total;
}
