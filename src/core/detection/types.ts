
// Phase 1: Core Types & Contracts

export type FrameworkName =
    | 'react' | 'vue' | 'svelte' | 'solid-js' | 'preact' | 'qwik' | 'angular' | 'lit'
    | 'next' | 'remix' | 'nuxt' | 'sveltekit' | 'astro' | 'unknown';

export type SignalSource = 'dependency' | 'filesystem' | 'entry' | 'config';

export interface DetectionSignal {
    framework: FrameworkName;
    source: SignalSource;
    strength: number; // 0-100
    evidence: string; // "Found dependency: react@18.2.0"
    versionRange?: string; // Captured from package.json
}

export interface RenderingMode {
    primary: 'spa' | 'ssr' | 'ssg' | 'isr';
    islands?: boolean;
    prerender?: boolean;
}

export interface DetectedFramework {
    name: FrameworkName;
    versionRange?: string;
    compatibility: 'full' | 'partial' | 'experimental' | 'unknown';
}

export interface FrameworkProfile {
    // List of all detected frameworks (e.g. ['react', 'next'])
    frameworks: DetectedFramework[];

    // The dominant framework/meta-framework driving the build
    primaryFramework: FrameworkName;

    // If a meta-framework is used (e.g. Next.js), it is listed here
    metaFramework?: FrameworkName;

    // Aggregated version range for the primary framework
    versionRange?: string;

    // Engine compatibility tier
    compatibility: 'full' | 'partial' | 'experimental' | 'unknown';

    // Inferred rendering intent
    rendering: RenderingMode;

    // Inferred routing style
    routing: 'file-based' | 'code-based' | 'none';

    // Runtime target inferred
    runtimeTarget: 'browser' | 'node' | 'edge' | 'mixed';

    // Discovered entry points (fed from detection or config)
    entryPoints: string[];
    serverEntry?: string;

    // Confidence metadata
    confidenceScore: number;
}

// Default/Fallback profile
export const UNKNOWN_PROFILE: FrameworkProfile = {
    frameworks: [],
    primaryFramework: 'unknown',
    compatibility: 'unknown',
    rendering: { primary: 'spa' },
    routing: 'none',
    runtimeTarget: 'browser',
    entryPoints: [],
    confidenceScore: 0
};
