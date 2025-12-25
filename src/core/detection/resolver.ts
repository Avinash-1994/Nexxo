
import {
    DetectionSignal,
    FrameworkProfile,
    FrameworkName,
    DetectedFramework,
    UNKNOWN_PROFILE
} from './types.js';
import { explainReporter } from '../engine/events.js';

const META_FRAMEWORK_MAP: Record<string, FrameworkName> = {
    'next': 'react',
    'remix': 'react',
    'nuxt': 'vue',
    'sveltekit': 'svelte',
    'solid-start': 'solid-js',
    'analog': 'angular'
    // Astro is special, can be its own primary
};

export function resolveFrameworkProfile(signals: DetectionSignal[]): FrameworkProfile {
    explainReporter.report('detect', 'aggregate', `Resolving profile from ${signals.length} signals`);

    // 1. Group by Framework
    const scores = new Map<FrameworkName, number>();
    const evidences = new Map<FrameworkName, string[]>();
    const versionRanges = new Map<FrameworkName, string>();

    for (const s of signals) {
        const current = scores.get(s.framework) || 0;
        scores.set(s.framework, current + s.strength);

        if (!evidences.has(s.framework)) evidences.set(s.framework, []);
        evidences.get(s.framework)!.push(s.evidence);

        if (s.versionRange && !versionRanges.has(s.framework)) {
            versionRanges.set(s.framework, s.versionRange);
        }
    }

    // 2. Sort by Score
    // Deterministic sort: Score desc, then Name asc
    const sortedFrameworks = Array.from(scores.keys()).sort((a, b) => {
        const scoreA = scores.get(a)!;
        const scoreB = scores.get(b)!;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.localeCompare(b);
    });

    if (sortedFrameworks.length === 0) {
        return UNKNOWN_PROFILE;
    }

    const DetectedFrameworks: DetectedFramework[] = sortedFrameworks.map(fw => ({
        name: fw,
        versionRange: versionRanges.get(fw),
        compatibility: 'full' // Placeholder logic for now, later version checks
    }));

    // 3. Identify Primary and Meta
    // Top score is usually the winner, but we must handle Meta relationships.
    // If 'next' is present, it's the Meta, implying 'react' as Primary.
    // If 'react' is top score (80) and 'next' is (40), we still might want to know it's a Next app.

    let meta: FrameworkName | undefined;
    let primary: FrameworkName = sortedFrameworks[0];

    // Check for meta-frameworks in the detected list
    // We prioritize detected meta-frameworks even if they have lower score than the lib?
    // e.g. React (40) + Next (30). It's a Next app.
    // But usually Next brings React dependency, so React score is high.
    // Let's look for known meta-frameworks in the list.
    const detectedMeta = sortedFrameworks.find(fw => Object.keys(META_FRAMEWORK_MAP).includes(fw));

    if (detectedMeta) {
        meta = detectedMeta;
        // Enforce the primary for this meta
        const impliedPrimary = META_FRAMEWORK_MAP[meta];
        if (impliedPrimary) {
            primary = impliedPrimary;
            // Ensure implied primary is in the list (it should be if deps are correct)
            if (!scores.has(primary)) {
                // Hybrid case or pure meta (unlikely for these pairs)
            }
        }
    } else {
        // No meta found, determine primary from top score
        // Only if it's not 'unknown'
    }

    // 4. Inferences
    // Routing
    let routing: 'file-based' | 'code-based' | 'none' = 'none';
    if (meta) {
        routing = 'file-based'; // Next, Nuxt, SvelteKit, Remix, Astro usually
    } else if (primary === 'angular') {
        routing = 'code-based'; // Traditionally
    } else if (['react', 'vue', 'svelte'].includes(primary)) {
        // SPA usually code-based or none
        // Check signals for 'react-router', etc? (Future)
        routing = 'code-based';
    }

    // Rendering
    // Default to SPA unless Meta/SSR signals
    let renderingPrimary: 'spa' | 'ssr' | 'ssg' = 'spa';
    if (meta || primary === 'astro' || primary === 'qwik') {
        renderingPrimary = 'ssr'; // Or SSG / Hybrid, strictly speaking 'server-capable'
    }

    // 5. Confidence Score
    // Normalized 0-1 based on top score threshold?
    // Or just Raw Score.
    // Let's use 0-100 logic.
    // If > 50, confident.
    const topScore = scores.get(meta || primary) || 0;
    const confidence = Math.min(topScore, 100);

    const profile: FrameworkProfile = {
        frameworks: DetectedFrameworks,
        primaryFramework: primary,
        metaFramework: meta,
        versionRange: versionRanges.get(primary),
        compatibility: 'full', // Default
        rendering: {
            primary: renderingPrimary
        },
        routing: routing,
        runtimeTarget: renderingPrimary === 'spa' ? 'browser' : 'node', // Default wrapper
        entryPoints: [], // Populated by caller or files scanner
        confidenceScore: confidence
    };

    explainReporter.report('detect', 'complete',
        `Resolved: ${meta ? meta + '+' : ''}${primary} (${confidence}%)`,
        { profile }
    );

    return profile;
}
