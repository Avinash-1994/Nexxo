import { ProjectProfile } from '../schema.js';

export interface Suggestion {
    id: string;
    title: string;
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
    action: {
        type: 'CONFIG_UPDATE';
        path: string;
        value: any;
    };
}

export class OptimizerEngine {
    static suggest(profile: ProjectProfile): Suggestion[] {
        const suggestions: Suggestion[] = [];

        // Rule 1: Code Splitting for React
        if (profile.framework === 'react') {
            suggestions.push({
                id: 'react-split',
                title: 'Enable React Code Splitting',
                description: 'Split vendor chunks for better caching.',
                impact: 'HIGH',
                confidence: 0.9,
                action: {
                    type: 'CONFIG_UPDATE',
                    path: 'build.splitting',
                    value: true
                }
            });
        }

        // Rule 2: CSS Purging (Tailwind)
        if (profile.devDependencies && profile.devDependencies['tailwindcss']) {
            suggestions.push({
                id: 'tailwind-purge',
                title: 'Enable CSS Purging',
                description: 'Remove unused Tailwind classes.',
                impact: 'HIGH',
                confidence: 0.95,
                action: {
                    type: 'CONFIG_UPDATE',
                    path: 'css.purge',
                    value: true
                }
            });
        }

        // Rule 3: TypeScript Strict Mode
        if (profile.language === 'typescript') {
            suggestions.push({
                id: 'ts-strict',
                title: 'Enable Strict Mode',
                description: 'Catch more errors at compile time.',
                impact: 'MEDIUM',
                confidence: 0.8,
                action: {
                    type: 'CONFIG_UPDATE',
                    path: 'typescript.strict',
                    value: true
                }
            });
        }

        return suggestions;
    }
}
