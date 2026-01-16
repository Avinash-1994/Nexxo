/**
 * Plugin Loading Tests - All 101 Plugins (Day 45)
 */

import { describe, it, expect } from '../src/test/api.js';
import { pluginRegistry } from '../src/plugins/registry.js';
import fs from 'fs';
import path from 'path';

const MARKETPLACE_DB = path.resolve(process.cwd(), 'marketplace.db.json');
const IMPLEMENTATIONS_DIR = path.resolve(process.cwd(), 'src/plugins/implementations');

describe('Plugin Loading - Production Ready', () => {
    it('should have all 101 plugin implementations', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const implementations = fs.readdirSync(IMPLEMENTATIONS_DIR);

        // Should have at least 110 implementations
        expect(implementations.length).toBeGreaterThan(110);
        expect(marketplace.totalPlugins).toBe(116);
    });

    it('should load React plugin', async () => {
        const plugin = await pluginRegistry.load('@nexxo/plugin-react');

        expect(plugin).toBeDefined();
        expect(plugin.name).toBe('@nexxo/plugin-react');
        expect(plugin.transform).toBeDefined();
    });

    it('should load Vue plugin', async () => {
        const plugin = await pluginRegistry.load('@nexxo/plugin-vue');

        expect(plugin).toBeDefined();
        expect(plugin.name).toBe('@nexxo/plugin-vue');
    });

    it('should load Sass plugin', async () => {
        const plugin = await pluginRegistry.load('@nexxo/plugin-sass');

        expect(plugin).toBeDefined();
        expect(plugin.name).toBe('@nexxo/plugin-sass');
    });

    it('should load TypeScript plugin', async () => {
        const plugin = await pluginRegistry.load('@nexxo/plugin-typescript');

        expect(plugin).toBeDefined();
        expect(plugin.name).toBe('@nexxo/plugin-typescript');
    });

    it('should load security plugins', async () => {
        const plugins = await pluginRegistry.loadByCategory('security');

        expect(plugins.length).toBeGreaterThan(0);
        expect(plugins.some(p => p.name.includes('audit'))).toBe(true);
    });

    it('should load fintech plugins', async () => {
        const plugins = await pluginRegistry.loadByCategory('fintech');

        expect(plugins.length).toBeGreaterThan(0);
        expect(plugins.some(p => p.name.includes('upi'))).toBe(true);
    });

    it('should load i18n plugins', async () => {
        const plugins = await pluginRegistry.loadByCategory('i18n');
        expect(plugins.length).toBeGreaterThan(0);
        expect(plugins.some(p => p.name.includes('i18next'))).toBe(true);
    });

    it('should load testing plugins', async () => {
        const plugins = await pluginRegistry.loadByCategory('testing');
        expect(plugins.length).toBeGreaterThan(0);
        expect(plugins.some(p => p.name.includes('jest'))).toBe(true);
    });

    it('should load state management plugins', async () => {
        const plugins = await pluginRegistry.loadByCategory('state');
        expect(plugins.length).toBeGreaterThan(0);
        expect(plugins.some(p => p.name.includes('zustand'))).toBe(true);
    });

    it('should load deployment plugins', async () => {
        const plugins = await pluginRegistry.loadByCategory('deployment');
        expect(plugins.length).toBeGreaterThan(0);
        expect(plugins.some(p => p.name.includes('vercel'))).toBe(true);
    });

    it('should load analytics plugins', async () => {
        const plugins = await pluginRegistry.loadByCategory('analytics');
        expect(plugins.length).toBeGreaterThan(0);
        expect(plugins.some(p => p.name.includes('plausible'))).toBe(true);
    });

    it('should get plugin stats', () => {
        const stats = pluginRegistry.getStats();

        expect(stats.total).toBe(116);
        expect(stats.categories).toBeDefined();
        expect(stats.categories.framework).toBeGreaterThan(0);
        expect(stats.categories.security).toBeGreaterThan(0);
        expect(stats.categories.i18n).toBeGreaterThan(0);
        expect(stats.categories.testing).toBeGreaterThan(0);
    });

    it('should verify all plugins have signatures', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));

        for (const plugin of marketplace.plugins) {
            expect(plugin.signature).toBeDefined();
            expect(plugin.signature).toContain('nexxo-sig-');
        }
    });

    it('should verify all plugins have permissions', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));

        for (const plugin of marketplace.plugins) {
            expect(plugin.permissions).toBeDefined();
            expect(Array.isArray(plugin.permissions)).toBe(true);
            expect(plugin.permissions.length).toBeGreaterThan(0);
        }
    });

    it('should verify all plugins are sandboxed', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));

        for (const plugin of marketplace.plugins) {
            expect(plugin.sandboxed).toBe(true);
            expect(plugin.wasmCompatible).toBe(true);
        }
    });
});
