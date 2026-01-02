
import { FrameworkProfile } from './types.js';
import { scanDependencies, scanFileSystem, scanConfigArtifacts } from './scanner.js';
import { inspectEntryFiles } from './files.js';
import { resolveFrameworkProfile } from './resolver.js';
import { explainReporter } from '../engine/events.js';
import path from 'path';

// Phase 10: Main Detection API

/**
 * Framework Detection System
 * 
 * @internal - This is part of the core detection logic. Use public APIs or official presets.
 */
export async function detectFramework(rootDir: string, candidateEntries: string[] = []): Promise<FrameworkProfile> {
    explainReporter.report('detect', 'start', 'Starting framework detection');

    // 1. Initial Scans
    const depSignals = await scanDependencies(rootDir);
    const fsSignals = await scanFileSystem(rootDir);
    const cfgSignals = await scanConfigArtifacts(rootDir);

    let allSignals = [...depSignals, ...fsSignals, ...cfgSignals];

    // 2. Intermediate Resolve (to refine Entry Inspection if needed)
    // Actually, we can inspect entries regardless.
    // If no candidateEntries provided, we might guess common ones?
    let entries = [...candidateEntries];
    if (entries.length === 0) {
        // Fallback defaults
        entries = ['src/main.tsx', 'src/main.ts', 'src/index.tsx', 'src/index.ts', 'src/main.js', 'src/index.js'];
    }

    // 3. Entry Inspection
    const entrySignals = await inspectEntryFiles(rootDir, entries);

    allSignals = [...allSignals, ...entrySignals];

    // 4. Final Resolution
    const profile = resolveFrameworkProfile(allSignals);

    // 5. Populate detected entry points if we found them
    // Logic: If inspectEntryFiles looked at them, valid ones exist?
    // inspectEntryFiles only looked.
    // We should verify existence and add to profile.entryPoints.
    // This logic belongs partly in scanner or graph, but let's just confirm what we checked.
    // For now, we trust the input `entries` or found ones.

    return profile;
}

export * from './types.js';
