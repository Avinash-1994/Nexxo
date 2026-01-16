/**
 * Migration Analyzer Tests - Vite Projects (Day 43)
 */

import { describe, it, expect, beforeAll, afterAll } from '../src/test/api.js';
import { MigrationAnalyzer } from '../src/migrate/analyzer.js';
import fs from 'fs';
import path from 'path';

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/migrate_vite');

describe('Migration Analyzer - Vite', () => {
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
            dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0'
            },
            devDependencies: {
                'vite': '^5.0.0',
                '@vitejs/plugin-react': '^4.2.0',
                'tailwindcss': '^3.4.0'
            }
        }, null, 2));

        // vite.config.ts
        fs.writeFileSync(path.join(FIXTURE_DIR, 'vite.config.ts'), `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});
        `);

        // tailwind.config.js
        fs.writeFileSync(path.join(FIXTURE_DIR, 'tailwind.config.js'), `
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: []
};
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

    it('should detect Vite toolchain', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.toolchainType).toBe('vite');
    });

    it('should detect React framework', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.frameworks).toContain('react');
    });

    it('should detect Tailwind CSS', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.cssSetup.hasTailwind).toBe(true);
    });

    it('should detect Vite plugins', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.plugins).toContain('@vitejs/plugin-react');
    });

    it('should have LOW risk level for simple Vite project', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.riskLevel).toBe('LOW');
    });

    it('should identify auto-migratable items', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.autoMigrate.length).toBeGreaterThan(0);
        expect(plan.autoMigrate.some(item => item.includes('Framework detection'))).toBe(true);
    });

    it('should identify manual steps', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.manualSteps.length).toBeGreaterThan(0);
        expect(plan.manualSteps.some(step => step.includes('environment variable'))).toBe(true);
    });

    it('should detect entry points', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.projectStructure.entryPoints.length).toBeGreaterThan(0);
        expect(plan.projectStructure.entryPoints).toContain('index.html');
    });
});
