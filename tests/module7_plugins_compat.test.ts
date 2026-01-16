/**
 * Plugin Compatibility Tests (Day 45)
 */

import { describe, it, expect } from '../src/test/api.js';
import fs from 'fs';
import path from 'path';

const MARKETPLACE_DB = path.resolve(process.cwd(), 'marketplace.db.json');

describe('Plugin Marketplace - Module 7', () => {
    it('should have marketplace database', () => {
        expect(fs.existsSync(MARKETPLACE_DB)).toBe(true);
    });

    it('should have 100+ plugins', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        expect(marketplace.totalPlugins).toBeGreaterThan(100);
    });

    it('should have all required categories', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const categories = new Set(marketplace.plugins.map((p: any) => p.category));

        expect(categories.has('framework')).toBe(true);
        expect(categories.has('css')).toBe(true);
        expect(categories.has('assets')).toBe(true);
        expect(categories.has('perf')).toBe(true);
        expect(categories.has('security')).toBe(true);
        expect(categories.has('fintech')).toBe(true);
        expect(categories.has('utility')).toBe(true);
    });

    it('should have plugins from all sources', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const sources = new Set(marketplace.plugins.map((p: any) => p.source));

        expect(sources.has('vite-port')).toBe(true);
        expect(sources.has('webpack-port')).toBe(true);
        expect(sources.has('nexxo-native')).toBe(true);
    });

    it('should have at least 20 Vite ports', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const vitePorts = marketplace.plugins.filter((p: any) => p.source === 'vite-port');

        expect(vitePorts.length).toBeGreaterThan(19);
    });

    it('should have at least 15 Webpack ports', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const webpackPorts = marketplace.plugins.filter((p: any) => p.source === 'webpack-port');

        expect(webpackPorts.length).toBeGreaterThan(14);
    });

    it('should have fintech plugins', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const fintechPlugins = marketplace.plugins.filter((p: any) => p.category === 'fintech');

        expect(fintechPlugins.length).toBeGreaterThan(0);
        expect(fintechPlugins.some((p: any) => p.name.includes('upi'))).toBe(true);
    });

    it('should have all plugins verified', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const allVerified = marketplace.plugins.every((p: any) => p.verified === true);

        expect(allVerified).toBe(true);
    });

    it('should have proper plugin metadata', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const samplePlugin = marketplace.plugins[0];

        expect(samplePlugin.name).toBeDefined();
        expect(samplePlugin.version).toBeDefined();
        expect(samplePlugin.category).toBeDefined();
        expect(samplePlugin.description).toBeDefined();
        expect(samplePlugin.author).toBeDefined();
        expect(samplePlugin.source).toBeDefined();
        expect(samplePlugin.verified).toBeDefined();
    });

    it('should have security plugins', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const securityPlugins = marketplace.plugins.filter((p: any) => p.category === 'security');

        expect(securityPlugins.length).toBeGreaterThan(0);
        expect(securityPlugins.some((p: any) => p.name.includes('audit'))).toBe(true);
    });

    it('should have performance plugins', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const perfPlugins = marketplace.plugins.filter((p: any) => p.category === 'perf');

        expect(perfPlugins.length).toBeGreaterThan(10);
    });

    it('should have framework plugins', () => {
        const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_DB, 'utf-8'));
        const frameworkPlugins = marketplace.plugins.filter((p: any) => p.category === 'framework');

        expect(frameworkPlugins.length).toBeGreaterThan(10);
        expect(frameworkPlugins.some((p: any) => p.name.includes('react'))).toBe(true);
        expect(frameworkPlugins.some((p: any) => p.name.includes('vue'))).toBe(true);
    });
});
