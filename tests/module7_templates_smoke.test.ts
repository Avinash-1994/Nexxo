/**
 * Template Generation Smoke Tests (Day 46)
 */

import { describe, it, expect, beforeAll, afterAll } from '../src/test/api.js';
import { templateManager } from '../src/templates/manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, 'temp_templates');

describe('Template Generation - Production Ready', () => {
    beforeAll(() => {
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR);
        }
    });

    afterAll(() => {
        if (fs.existsSync(TEMP_DIR)) {
            fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        }
    });

    it('should have all templates registered', () => {
        const templates = templateManager.getAll();
        expect(templates.length).toBeGreaterThan(5);

        expect(templateManager.get('react-spa')).toBeDefined();
        expect(templateManager.get('vue-spa')).toBeDefined();
        expect(templateManager.get('svelte-spa')).toBeDefined();
        expect(templateManager.get('solid-spa')).toBeDefined();
        expect(templateManager.get('react-ssr')).toBeDefined();
        expect(templateManager.get('edge-function')).toBeDefined();
    });

    it('should scaffold React SPA template correctly', async () => {
        const targetDir = path.join(TEMP_DIR, 'my-react-app');
        await templateManager.scaffold('react-spa', targetDir, 'my-react-app');

        // Verify files
        expect(fs.existsSync(path.join(targetDir, 'package.json'))).toBe(true);
        expect(fs.existsSync(path.join(targetDir, 'tsconfig.json'))).toBe(true);
        expect(fs.existsSync(path.join(targetDir, 'README.md'))).toBe(true);
        expect(fs.existsSync(path.join(targetDir, 'src/main.tsx'))).toBe(true);

        // Verify content replacement
        const indexHtml = fs.readFileSync(path.join(targetDir, 'index.html'), 'utf-8');
        expect(indexHtml).toContain('<title>my-react-app</title>');
    });

    it('should scaffold Vue SPA template correctly', async () => {
        const targetDir = path.join(TEMP_DIR, 'my-vue-app');
        await templateManager.scaffold('vue-spa', targetDir, 'my-vue-app');

        // Verify files
        expect(fs.existsSync(path.join(targetDir, 'package.json'))).toBe(true);
        expect(fs.existsSync(path.join(targetDir, 'src/App.vue'))).toBe(true);
        expect(fs.existsSync(path.join(targetDir, 'src/main.ts'))).toBe(true);
    });

    it('should contain production-ready configuration', async () => {
        const targetDir = path.join(TEMP_DIR, 'check-config');
        await templateManager.scaffold('react-spa', targetDir, 'check-config');

        const tsconfig = JSON.parse(fs.readFileSync(path.join(targetDir, 'tsconfig.json'), 'utf-8'));

        // Strict mode enabled
        expect(tsconfig.compilerOptions.strict).toBe(true);
        // No unused locals
        expect(tsconfig.compilerOptions.noUnusedLocals).toBe(true);
    });
});
