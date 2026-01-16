/**
 * Migration Generator Tests - Vite Projects (Day 44)
 */

import { describe, it, expect, beforeAll, afterAll } from '../src/test/api.js';
import { MigrationAnalyzer } from '../src/migrate/analyzer.js';
import { MigrationGenerator } from '../src/migrate/generator.js';
import fs from 'fs';
import path from 'path';

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/migrate_gen_vite');

describe('Migration Generator - Vite', () => {
    beforeAll(async () => {
        // Create Vite React fixture
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(path.join(FIXTURE_DIR, 'src'), { recursive: true });

        // package.json
        fs.writeFileSync(path.join(FIXTURE_DIR, 'package.json'), JSON.stringify({
            name: 'vite-react-app',
            type: 'module',
            scripts: {
                'dev': 'vite',
                'build': 'vite build',
                'preview': 'vite preview'
            },
            dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0'
            },
            devDependencies: {
                'vite': '^5.0.0',
                '@vitejs/plugin-react': '^4.2.0'
            }
        }, null, 2));

        // vite.config.ts
        fs.writeFileSync(path.join(FIXTURE_DIR, 'vite.config.ts'), `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
});
        `);

        // src/main.tsx
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/main.tsx'), `
import React from 'react';
import ReactDOM from 'react-dom/client';
ReactDOM.createRoot(document.getElementById('root')!).render(<div>Hello</div>);
        `);

        // index.html
        fs.writeFileSync(path.join(FIXTURE_DIR, 'index.html'), `
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
        `);
    });

    afterAll(async () => {
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
    });

    it('should generate nexxo.config.ts in dry-run mode', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: true });
        const result = await generator.generate();

        expect(result.success).toBe(true);
        expect(result.files).toContain('nexxo.config.ts');

        // Should NOT create file in dry-run
        expect(fs.existsSync(path.join(FIXTURE_DIR, 'nexxo.config.ts'))).toBe(false);
    });

    it('should generate nexxo.config.ts with correct framework', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: false });
        const result = await generator.generate();

        expect(result.success).toBe(true);

        // Check file was created
        const configPath = path.join(FIXTURE_DIR, 'nexxo.config.ts');
        expect(fs.existsSync(configPath)).toBe(true);

        // Check content
        const content = fs.readFileSync(configPath, 'utf-8');
        expect(content).toContain('defineConfig');
        expect(content).toContain('"framework": "react"');
    });

    it('should update package.json with Nexxo scripts', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: false });
        await generator.generate();

        const pkgPath = path.join(FIXTURE_DIR, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

        expect(pkg.scripts.dev).toBe('nexxo dev');
        expect(pkg.scripts.build).toBe('nexxo build');
        expect(pkg.devDependencies.nexxo).toBe('^2.0.0');
    });

    it('should generate MIGRATION_REPORT.md', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: false });
        const result = await generator.generate();

        expect(result.files).toContain('MIGRATION_REPORT.md');

        const reportPath = path.join(FIXTURE_DIR, 'MIGRATION_REPORT.md');
        expect(fs.existsSync(reportPath)).toBe(true);

        const content = fs.readFileSync(reportPath, 'utf-8');
        expect(content).toContain('# Nexxo Migration Report');
        expect(content).toContain('vite');
        expect(content).toContain('react');
    });

    it('should include auto-migrated items in report', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: false });
        const result = await generator.generate();

        expect(result.report).toContain('Auto-Migrated');
        expect(result.report).toContain('Framework detection');
    });

    it('should include manual steps in report', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: false });
        const result = await generator.generate();

        expect(result.report).toContain('Manual Steps Required');
        expect(result.report).toContain('environment variable');
    });

    it('should create backup directory when backup is enabled', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: true });
        await generator.generate();

        const backupDir = path.join(FIXTURE_DIR, '.nexxo-migration-backup');
        expect(fs.existsSync(backupDir)).toBe(true);
        expect(fs.existsSync(path.join(backupDir, 'package.json'))).toBe(true);
    });
});
