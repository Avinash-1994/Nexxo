
import fs from 'fs/promises';
import path from 'path';
import { DetectionSignal } from './types.js';
import { explainReporter } from '../engine/events.js';

// Phase 4: Entry File Inspection
export async function inspectEntryFiles(rootDir: string, entryFiles: string[]): Promise<DetectionSignal[]> {
    const signals: DetectionSignal[] = [];

    for (const entry of entryFiles) {
        const absEntry = path.resolve(rootDir, entry);
        let content = '';
        try {
            content = await fs.readFile(absEntry, 'utf-8');
        } catch (e) {
            continue;
        }

        // Framework specific signals

        // React
        if (content.includes('createRoot') || content.includes('hydrateRoot')) {
            signals.push({
                framework: 'react',
                source: 'entry',
                strength: 30,
                evidence: `Found React initialization in ${entry}`
            });
        }

        // Vue
        if (content.includes('createApp') && (content.includes('vue') || entry.endsWith('.ts') || entry.endsWith('.js'))) {
            signals.push({
                framework: 'vue',
                source: 'entry',
                strength: 30,
                evidence: `Found Vue createApp in ${entry}`
            });
        }

        // Svelte
        if (content.includes('new App') && content.includes('target:')) {
            signals.push({
                framework: 'svelte',
                source: 'entry',
                strength: 30,
                evidence: `Found Svelte app initialization in ${entry}`
            });
        }

        // Angular
        if (content.includes('platformBrowserDynamic') || content.includes('bootstrapModule')) {
            signals.push({
                framework: 'angular',
                source: 'entry',
                strength: 40,
                evidence: `Found Angular bootstrap in ${entry}`
            });
        }

        // Meta-framework Specific Exports

        // Next.js (Pages router)
        if (content.includes('getStaticProps') || content.includes('getServerSideProps')) {
            signals.push({
                framework: 'next',
                source: 'entry',
                strength: 40,
                evidence: `Found Next.js data fetching in ${entry}`
            });
        }

        // Remix
        if (content.includes('export const loader') || content.includes('export const action')) {
            // Ambiguous as generic loaders exist, but strong hint with routes
            // We give it moderate weight
            signals.push({
                framework: 'remix',
                source: 'entry',
                strength: 20,
                evidence: `Found Remix-style loader/action in ${entry}`
            });
        }

        explainReporter.report('detect', 'inspect', `Inspected ${entry}`);
    }

    return signals;
}
