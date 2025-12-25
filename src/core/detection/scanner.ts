
import path from 'path';
import fs from 'fs/promises';
import { DetectionSignal, FrameworkName, SignalSource } from './types.js';
import { explainReporter } from '../engine/events.js';

// Phase 2: Dependency Scanner
export async function scanDependencies(rootDir: string): Promise<DetectionSignal[]> {
    const signals: DetectionSignal[] = [];

    let pkg: any;
    try {
        const pkgContent = await fs.readFile(path.join(rootDir, 'package.json'), 'utf-8');
        pkg = JSON.parse(pkgContent);
    } catch (e) {
        // No package.json, can't scan deps
        return signals;
    }

    const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies
    };

    const FRAMEWORK_MAP: Record<string, FrameworkName> = {
        'react': 'react',
        'vue': 'vue',
        'svelte': 'svelte',
        'solid-js': 'solid-js',
        'preact': 'preact',
        '@builder.io/qwik': 'qwik',
        '@angular/core': 'angular',
        'lit': 'lit',
        'next': 'next',
        '@remix-run/react': 'remix',
        '@remix-run/node': 'remix',
        'remix': 'remix', // v1
        'nuxt': 'nuxt',
        '@sveltejs/kit': 'sveltekit',
        'astro': 'astro'
    };

    for (const [dep, version] of Object.entries(allDeps)) {
        if (FRAMEWORK_MAP[dep]) {
            const fw = FRAMEWORK_MAP[dep];
            signals.push({
                framework: fw,
                source: 'dependency',
                strength: 40, // Strong signal
                evidence: `Found dependency: ${dep}@${version}`,
                versionRange: typeof version === 'string' ? version : undefined
            });
            explainReporter.report('detect', 'signal', `Dependency signal: ${fw} from ${dep}`);
        }
    }

    return signals;
}

// Phase 3: File System Scanner
export async function scanFileSystem(rootDir: string): Promise<DetectionSignal[]> {
    const signals: DetectionSignal[] = [];

    // Simple existence checks
    const check = async (p: string) => {
        try {
            await fs.access(path.join(rootDir, p));
            return true;
        } catch { return false; }
    };

    // Heuristics
    if (await check('pages') || await check('app')) {
        // Next.js uses /pages or /app. But generic apps might too.
        // We give it moderate weight.
        signals.push({
            framework: 'next',
            source: 'filesystem',
            strength: 20,
            evidence: 'Found /pages or /app directory'
        });
    }

    if (await check('routes') || await check('app/routes')) {
        signals.push({
            framework: 'remix',
            source: 'filesystem',
            strength: 20,
            evidence: 'Found /routes directory'
        });
    }

    if (await check('src/routes')) {
        signals.push({
            framework: 'sveltekit',
            source: 'filesystem',
            strength: 20,
            evidence: 'Found /src/routes directory'
        });
        signals.push({
            framework: 'solid-js', // SolidStart also uses src/routes often
            source: 'filesystem',
            strength: 10,
            evidence: 'Found /src/routes directory (ambiguous)'
        });
    }

    if (await check('astro.config.mjs') || await check('astro.config.ts')) {
        // Config file is also a FS signal but we have a dedicated config scanner. 
        // We can include it here or there. The prompt distinguishes them.
        // "Phase 3: /astro.config.* -> Astro"
        signals.push({
            framework: 'astro',
            source: 'filesystem',
            strength: 30, // Pretty strong
            evidence: 'Found astro config file'
        });
    }

    if (await check('angular.json')) {
        signals.push({
            framework: 'angular',
            source: 'filesystem',
            strength: 30,
            evidence: 'Found angular.json'
        });
    }

    return signals;
}

// Phase 5: Config Artifact Inspection
export async function scanConfigArtifacts(rootDir: string): Promise<DetectionSignal[]> {
    const signals: DetectionSignal[] = [];

    const check = async (p: string, fw: FrameworkName) => {
        try {
            await fs.access(path.join(rootDir, p));
            signals.push({
                framework: fw,
                source: 'config',
                strength: 10, // Confirmation signal
                evidence: `Found config file: ${p}`
            });
        } catch { }
    };

    await check('next.config.js', 'next');
    await check('next.config.ts', 'next');
    await check('next.config.mjs', 'next');

    await check('nuxt.config.js', 'nuxt');
    await check('nuxt.config.ts', 'nuxt');

    await check('svelte.config.js', 'svelte');
    await check('svelte.config.ts', 'svelte'); // SvelteKit usually

    await check('remix.config.js', 'remix');
    await check('vite.config.ts', 'unknown'); // Generic, but might prompt deep scan

    return signals;
}
