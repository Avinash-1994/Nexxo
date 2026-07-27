/**
 * HMR Test Suite — Agent 1
 * Tests the HMR classification engine, overlay, and decision logic.
 */

import { HMRClassifier, HMRLevel, hmrClassifier } from '../../src/hmr/classifier.js';
import { HMROverlay } from '../../src/hmr/overlay.js';
import fs from 'fs';
import path from 'path';

// ──────────────────────────────────────────────────────────────────────
// HMR-001: Basic JS module update → HMR_PARTIAL (not full reload)
// ──────────────────────────────────────────────────────────────────────
test('HMR-001: JS module update classified as HMR_PARTIAL', () => {
    const result = hmrClassifier.classify({
        path: 'src/components/Button.js',
        type: 'updated',
    });
    expect(result.level).toBe(HMRLevel.HMR_PARTIAL);
    expect(result.level).not.toBe(HMRLevel.HMR_FULL_RELOAD);
    expect(result.affectedModules).toContain('src/components/Button.js');
});

// ──────────────────────────────────────────────────────────────────────
// HMR-002: React Fast Refresh — .tsx component change → HMR_PARTIAL
// ──────────────────────────────────────────────────────────────────────
test('HMR-002: React .tsx component change → HMR_PARTIAL (not full reload)', () => {
    const result = hmrClassifier.classify({
        path: 'src/components/Counter.tsx',
        type: 'updated',
    });
    expect(result.level).toBe(HMRLevel.HMR_PARTIAL);
    expect(result.level).not.toBe(HMRLevel.HMR_FULL_RELOAD);
});

// ──────────────────────────────────────────────────────────────────────
// HMR-003: Vue component HMR — .vue file change → HMR_PARTIAL
// ──────────────────────────────────────────────────────────────────────
test('HMR-003: Vue .vue file change → HMR_PARTIAL (not full reload)', () => {
    const result = hmrClassifier.classify({
        path: 'src/components/App.vue',
        type: 'updated',
    });
    expect(result.level).toBe(HMRLevel.HMR_PARTIAL);
    expect(result.level).not.toBe(HMRLevel.HMR_FULL_RELOAD);
});

// ──────────────────────────────────────────────────────────────────────
// HMR-004: Svelte component HMR — .svelte file change → HMR_PARTIAL
// ──────────────────────────────────────────────────────────────────────
test('HMR-004: Svelte .svelte file change → HMR_PARTIAL (not full reload)', () => {
    const result = hmrClassifier.classify({
        path: 'src/components/App.svelte',
        type: 'updated',
    });
    expect(result.level).toBe(HMRLevel.HMR_PARTIAL);
    expect(result.level).not.toBe(HMRLevel.HMR_FULL_RELOAD);
});

// ──────────────────────────────────────────────────────────────────────
// HMR-005: CSS HMR — no page reload
// ──────────────────────────────────────────────────────────────────────
test('HMR-005: CSS file change → HMR_SAFE (no page reload)', () => {
    const cssResult = hmrClassifier.classify({
        path: 'src/styles/main.css',
        type: 'updated',
    });
    expect(cssResult.level).toBe(HMRLevel.HMR_SAFE);
    expect(cssResult.level).not.toBe(HMRLevel.HMR_FULL_RELOAD);

    const moduleResult = hmrClassifier.classify({
        path: 'src/components/Button.module.css',
        type: 'updated',
    });
    expect(moduleResult.level).toBe(HMRLevel.HMR_SAFE);
});

// ──────────────────────────────────────────────────────────────────────
// HMR-006: Tailwind class change in JSX → HMR_PARTIAL (not full reload)
// ──────────────────────────────────────────────────────────────────────
test('HMR-006: JSX Tailwind class change → HMR_PARTIAL (not full reload)', () => {
    const result = hmrClassifier.classify({
        path: 'src/components/Card.jsx',
        type: 'updated',
    });
    expect(result.level).toBe(HMRLevel.HMR_PARTIAL);
    expect(result.level).not.toBe(HMRLevel.HMR_FULL_RELOAD);
});

// ──────────────────────────────────────────────────────────────────────
// HMR-007: Error overlay — HMROverlay class exists with show/hide methods
// ──────────────────────────────────────────────────────────────────────
test('HMR-007: HMROverlay class has show() and hide() methods', () => {
    const overlay = new HMROverlay();
    expect(typeof overlay.show).toBe('function');
    expect(typeof overlay.hide).toBe('function');
});

test('HMR-007b: HMROverlay instantiates with custom options', () => {
    const overlay = new HMROverlay({
        position: 'top-left',
        autoHide: false,
        showOptimizations: false,
    });
    expect(overlay).toBeDefined();
});

// ──────────────────────────────────────────────────────────────────────
// HMR-008: Circular dependency detection → HMR_FULL_RELOAD
// ──────────────────────────────────────────────────────────────────────
test('HMR-008: Circular dependency triggers HMR_FULL_RELOAD (not infinite loop)', () => {
    const circularGraph = new Map<string, Set<string>>([
        ['a.js', new Set(['b.js'])],
        ['b.js', new Set(['a.js'])], // circular: a → b → a
    ]);

    const result = hmrClassifier.classify(
        { path: 'a.js', type: 'updated' },
        circularGraph
    );

    // Should detect circular dep and escalate to full reload (safe choice)
    expect(result.level).toBe(HMRLevel.HMR_FULL_RELOAD);
    expect(result.reason).toContain('Circular');
});

// ──────────────────────────────────────────────────────────────────────
// HMR-009: HMR decision has required metadata fields
// ──────────────────────────────────────────────────────────────────────
test('HMR-009: HMR decision includes required metadata (level, reason, affectedModules, graphChanges)', () => {
    const result = hmrClassifier.classify({
        path: 'src/components/Widget.tsx',
        type: 'updated',
    });

    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('affectedModules');
    expect(result).toHaveProperty('graphChanges');
    expect(typeof result.level).toBe('string');
    expect(typeof result.reason).toBe('string');
    expect(Array.isArray(result.affectedModules)).toBe(true);
    expect(Array.isArray(result.graphChanges)).toBe(true);
});

// ──────────────────────────────────────────────────────────────────────
// HMR-010: Module graph integrity — propagation through import graph
// ──────────────────────────────────────────────────────────────────────
test('HMR-010: HMR propagates through dependency graph correctly', () => {
    const graph = new Map<string, Set<string>>([
        ['page.tsx', new Set(['widget.tsx'])],
        ['app.tsx', new Set(['page.tsx'])],
        ['widget.tsx', new Set(['utils.ts'])],
    ]);

    const result = hmrClassifier.classify(
        { path: 'widget.tsx', type: 'updated' },
        graph
    );

    // widget.tsx is depended on by page.tsx
    expect(result.affectedModules).toContain('widget.tsx');
    expect(result.affectedModules).toContain('page.tsx');
    expect(result.graphChanges.length).toBeGreaterThan(0);
});

// ──────────────────────────────────────────────────────────────────────
// HMR-011: Config file change → full reload
// ──────────────────────────────────────────────────────────────────────
test('HMR-EXTRA: Config file change always triggers HMR_FULL_RELOAD', () => {
    const configs = ['lunx.config.js', 'lunx.config.ts', 'package.json', 'tsconfig.json'];
    for (const cfg of configs) {
        const result = hmrClassifier.classify({ path: cfg, type: 'updated' });
        expect(result.level).toBe(HMRLevel.HMR_FULL_RELOAD);
    }
});

// ──────────────────────────────────────────────────────────────────────
// HMR-012: Batch classification — mixed changes escalate correctly
// ──────────────────────────────────────────────────────────────────────
test('HMR-EXTRA: Batch with config change escalates all to HMR_FULL_RELOAD', () => {
    const changes = [
        { path: 'src/Button.tsx', type: 'updated' as const },
        { path: 'src/styles.css', type: 'updated' as const },
        { path: 'package.json', type: 'updated' as const }, // triggers full reload
    ];

    const result = hmrClassifier.classifyBatch(changes);
    expect(result.level).toBe(HMRLevel.HMR_FULL_RELOAD);
});

test('HMR-EXTRA: Batch with only CSS changes stays at HMR_SAFE', () => {
    const changes = [
        { path: 'src/main.css', type: 'updated' as const },
        { path: 'src/theme.scss', type: 'updated' as const },
    ];

    const result = hmrClassifier.classifyBatch(changes);
    expect(result.level).toBe(HMRLevel.HMR_SAFE);
});

// ──────────────────────────────────────────────────────────────────────
// HMR-013: Asset file changes → HMR_SAFE
// ──────────────────────────────────────────────────────────────────────
test('HMR-EXTRA: Image/font asset changes → HMR_SAFE', () => {
    const assets = ['logo.png', 'hero.jpg', 'font.woff2', 'icon.svg'];
    for (const asset of assets) {
        const result = hmrClassifier.classify({ path: asset, type: 'updated' });
        expect(result.level).toBe(HMRLevel.HMR_SAFE);
    }
});

test('HMR-EXTRA: DevServer injects HMR client fallback for HMR_PARTIAL', () => {
    const devServerSource = fs.readFileSync(path.resolve('src/dev-server.ts'), 'utf8');
    expect(devServerSource).toContain("if (data.decision.level === 'HMR_PARTIAL')");
    expect(devServerSource).toContain('import.meta.hot.accept();');
    expect(devServerSource).toContain('Falling back to full reload');
});
