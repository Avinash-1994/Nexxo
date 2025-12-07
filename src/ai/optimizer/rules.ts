import { ProjectProfile } from '../schema.js';

export interface OptimizationSuggestion {
    id: string;
    title: string;
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    risk: 'low' | 'medium' | 'high';
    configPatch?: string;
}

export class RulesEngine {
    static analyze(profile: ProjectProfile): OptimizationSuggestion[] {
        const suggestions: OptimizationSuggestion[] = [];

        // Rule 1: Tailwind Purge
        if (profile.cssFramework === 'tailwind') {
            // Check if we can infer it's unoptimized (mock logic for now)
            suggestions.push({
                id: 'tailwind-purge',
                title: 'Enable Tailwind Purge',
                description: 'Configure content globs to remove unused CSS.',
                impact: 'HIGH',
                risk: 'low',
                configPatch: 'css: { tailwind: { purge: ["./src/**/*.{ts,tsx,vue}"] } }'
            });
        }

        // Rule 2: Vendor Chunk Splitting
        if (profile.dependencies && Object.keys(profile.dependencies).length > 10) {
            suggestions.push({
                id: 'vendor-split',
                title: 'Split Vendor Chunk',
                description: 'Separate third-party dependencies into a vendor chunk for better caching.',
                impact: 'HIGH',
                risk: 'low',
                configPatch: 'build: { splitChunks: true }'
            });
        }

        // Rule 3: Image Optimization
        suggestions.push({
            id: 'image-opt',
            title: 'Enable Image Optimization',
            description: 'Compress images at build time.',
            impact: 'MEDIUM',
            risk: 'low'
        });

        return suggestions;
    }
}
