/**
 * Framework Support Test Suite — Agent 4
 * Tests framework presets, detection, extensions, HMR config, and build options.
 */

import {
    frameworkPresets,
    getFrameworkPreset,
    getFrameworkExtensions,
    isFrameworkFile,
} from '../../src/presets/frameworks.js';

const SUPPORTED_FRAMEWORKS = [
    'react', 'vue', 'svelte', 'solid', 'preact', 'qwik',
    'lit', 'alpine', 'vanilla',
] as const;

// ──────────────────────────────────────────────────────────────────────
// FW-A: Framework preset exists with correct name
// ──────────────────────────────────────────────────────────────────────
describe('FW-A: Framework presets exist', () => {
    for (const fw of SUPPORTED_FRAMEWORKS) {
        test(`${fw} preset exists and has correct name`, () => {
            const preset = getFrameworkPreset(fw as any);
            expect(preset).toBeDefined();
            expect(preset.name).toBe(fw);
        });
    }
});

// ──────────────────────────────────────────────────────────────────────
// FW-B: Framework config has extensions defined
// ──────────────────────────────────────────────────────────────────────
describe('FW-B: Framework config has valid extensions', () => {
    for (const fw of SUPPORTED_FRAMEWORKS) {
        test(`${fw} has non-empty extensions array`, () => {
            const preset = getFrameworkPreset(fw as any);
            expect(Array.isArray(preset.extensions)).toBe(true);
            expect(preset.extensions.length).toBeGreaterThan(0);
            // All extensions start with '.'
            preset.extensions.forEach(ext => {
                expect(ext.startsWith('.')).toBe(true);
            });
        });
    }
});

// ──────────────────────────────────────────────────────────────────────
// FW-C: Framework-specific file extensions are recognized
// ──────────────────────────────────────────────────────────────────────
describe('FW-C: Framework-specific files are recognized', () => {
    const frameworkFileSamples: Record<string, string[]> = {
        react:   ['App.tsx', 'Button.jsx'],
        vue:     ['App.vue', 'main.ts'],
        svelte:  ['App.svelte', 'main.ts'],
        solid:   ['App.tsx', 'Counter.jsx'],
        preact:  ['App.tsx', 'Button.jsx'],
        qwik:    ['App.tsx', 'root.tsx'],
        lit:     ['my-element.ts', 'component.js'],
        alpine:  ['app.js', 'store.ts'],
        vanilla: ['main.ts', 'utils.js'],
    };

    for (const fw of SUPPORTED_FRAMEWORKS) {
        test(`${fw} recognizes its primary file types`, () => {
            const files = frameworkFileSamples[fw] || [];
            files.forEach(file => {
                expect(isFrameworkFile(file, fw as any)).toBe(true);
            });
        });
    }
});

// ──────────────────────────────────────────────────────────────────────
// FW-D: HMR is enabled for all frameworks
// ──────────────────────────────────────────────────────────────────────
describe('FW-D: HMR is configured for each framework', () => {
    for (const fw of SUPPORTED_FRAMEWORKS) {
        test(`${fw} has HMR enabled`, () => {
            const preset = getFrameworkPreset(fw as any);
            expect(preset.hmr).toBeDefined();
            expect(preset.hmr!.enabled).toBe(true);
        });
    }
});

// ──────────────────────────────────────────────────────────────────────
// FW-E: Transform config exists per framework
// ──────────────────────────────────────────────────────────────────────
describe('FW-E: Transform configuration is present', () => {
    test('react has babel transform with jsx preset', () => {
        const preset = getFrameworkPreset('react');
        expect(preset.transform?.babel?.presets).toBeDefined();
        const presets = preset.transform!.babel!.presets as any[];
        const hasReactPreset = presets.some(p =>
            (Array.isArray(p) ? p[0] : p)?.toString().includes('react')
        );
        expect(hasReactPreset).toBe(true);
    });

    test('vue has custom SFC transformer', () => {
        const preset = getFrameworkPreset('vue');
        expect(preset.transform?.custom).toBe('vue-sfc');
    });

    test('svelte has custom svelte transformer', () => {
        const preset = getFrameworkPreset('svelte');
        expect(preset.transform?.custom).toBe('svelte');
    });

    test('solid has babel preset with solid plugin', () => {
        const preset = getFrameworkPreset('solid');
        expect(preset.transform?.babel?.presets).toBeDefined();
        const presets = preset.transform!.babel!.presets as any[];
        const hasSolid = presets.some(p =>
            (Array.isArray(p) ? p[0] : p)?.toString().includes('solid')
        );
        expect(hasSolid).toBe(true);
    });

    test('lit uses esbuild with decorators support', () => {
        const preset = getFrameworkPreset('lit');
        expect(preset.transform?.esbuild).toBeDefined();
        // experimentalDecorators required for Lit
        const tsconfig = preset.transform!.esbuild!.tsconfigRaw?.compilerOptions;
        expect(tsconfig?.experimentalDecorators).toBe(true);
    });

    test('vanilla uses esbuild transform', () => {
        const preset = getFrameworkPreset('vanilla');
        expect(preset.transform?.esbuild).toBeDefined();
    });
});

// ──────────────────────────────────────────────────────────────────────
// FW-F: Production build options configured correctly
// ──────────────────────────────────────────────────────────────────────
describe('FW-F: Production build options are set', () => {
    for (const fw of SUPPORTED_FRAMEWORKS) {
        test(`${fw} has minify, sourcemap, and splitting in build config`, () => {
            const preset = getFrameworkPreset(fw as any);
            expect(preset.build).toBeDefined();
            expect(preset.build!.minify).toBe(true);
            expect(preset.build!.sourcemap).toBe(true);
            expect(preset.build!.splitting).toBe(true);
        });
    }
});

// ──────────────────────────────────────────────────────────────────────
// FW-G: JSX runtime is configured for JSX frameworks
// ──────────────────────────────────────────────────────────────────────
describe('FW-G: JSX runtime configuration', () => {
    test('react uses automatic JSX runtime', () => {
        const preset = getFrameworkPreset('react');
        expect(preset.jsx?.runtime).toBe('automatic');
        expect(preset.jsx?.importSource).toBe('react');
    });

    test('preact uses preact JSX import source', () => {
        const preset = getFrameworkPreset('preact');
        expect(preset.jsx?.importSource).toBe('preact');
    });

    test('solid uses solid-js JSX import source', () => {
        const preset = getFrameworkPreset('solid');
        expect(preset.jsx?.importSource).toBe('solid-js');
    });

    test('qwik uses qwik JSX import source', () => {
        const preset = getFrameworkPreset('qwik');
        expect(preset.jsx?.importSource).toContain('qwik');
    });
});

// ──────────────────────────────────────────────────────────────────────
// FW-H: TypeScript support — TS files recognized by each framework
// ──────────────────────────────────────────────────────────────────────
describe('FW-H: TypeScript support per framework', () => {
    for (const fw of SUPPORTED_FRAMEWORKS) {
        test(`${fw} recognizes .ts files for TypeScript support`, () => {
            expect(isFrameworkFile('component.ts', fw as any)).toBe(true);
        });
    }

    test('react recognizes .tsx for React + TypeScript', () => {
        expect(isFrameworkFile('App.tsx', 'react')).toBe(true);
    });

    test('vue recognizes .vue + .ts', () => {
        expect(isFrameworkFile('App.vue', 'vue')).toBe(true);
        expect(isFrameworkFile('types.ts', 'vue')).toBe(true);
    });

    test('svelte recognizes .svelte files', () => {
        expect(isFrameworkFile('App.svelte', 'svelte')).toBe(true);
    });
});

// ──────────────────────────────────────────────────────────────────────
// FW-EXTRA: getFrameworkPreset falls back to vanilla for unknown
// ──────────────────────────────────────────────────────────────────────
test('FW-EXTRA: getFrameworkPreset falls back to vanilla for unknown framework', () => {
    const preset = getFrameworkPreset('unknown-framework' as any);
    expect(preset).toBeDefined();
    expect(preset.name).toBe('vanilla');
});

// ──────────────────────────────────────────────────────────────────────
// FW-EXTRA: HMR runtime specified for React (react-refresh)
// ──────────────────────────────────────────────────────────────────────
test('FW-EXTRA: React preset specifies react-refresh HMR runtime', () => {
    const preset = getFrameworkPreset('react');
    expect(preset.hmr?.runtime).toBe('react-refresh');
});

test('FW-EXTRA: Preact preset specifies @prefresh/core HMR runtime', () => {
    const preset = getFrameworkPreset('preact');
    expect(preset.hmr?.runtime).toBe('@prefresh/core');
});

// ──────────────────────────────────────────────────────────────────────
// FW-EXTRA: frameworkPresets contains all expected frameworks
// ──────────────────────────────────────────────────────────────────────
test('FW-EXTRA: frameworkPresets object contains all tested frameworks', () => {
    const allFrameworks = Object.keys(frameworkPresets);
    for (const fw of SUPPORTED_FRAMEWORKS) {
        expect(allFrameworks).toContain(fw);
    }
});
