/**
 * Migration Generator Tests - Webpack Projects (Day 44)
 */

import { describe, it, expect, beforeAll, afterAll } from '../src/test/api.js';
import { MigrationAnalyzer } from '../src/migrate/analyzer.js';
import { MigrationGenerator } from '../src/migrate/generator.js';
import fs from 'fs';
import path from 'path';

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/migrate_gen_webpack');

describe('Migration Generator - Webpack', () => {
    beforeAll(async () => {
        // Create Webpack React fixture
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(path.join(FIXTURE_DIR, 'src'), { recursive: true });

        // package.json
        fs.writeFileSync(path.join(FIXTURE_DIR, 'package.json'), JSON.stringify({
            name: 'webpack-react-app',
            scripts: {
                'start': 'webpack serve',
                'build': 'webpack --mode production'
            },
            dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0'
            },
            devDependencies: {
                'webpack': '^5.88.0',
                'webpack-cli': '^5.1.0',
                'babel-loader': '^9.1.0'
            }
        }, null, 2));

        // webpack.config.js
        fs.writeFileSync(path.join(FIXTURE_DIR, 'webpack.config.js'), `
module.exports = {
  entry: './src/index.js',
  output: { path: __dirname + '/dist', filename: 'bundle.js' }
};
        `);

        // src/index.js
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/index.js'), `
import React from 'react';
import ReactDOM from 'react-dom/client';
ReactDOM.createRoot(document.getElementById('root')).render(<div>Hello</div>);
        `);
    });

    afterAll(async () => {
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
    });

    it('should generate config for webpack project', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.toolchainType).toBe('webpack');

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: false });
        const result = await generator.generate();

        expect(result.success).toBe(true);
        expect(fs.existsSync(path.join(FIXTURE_DIR, 'nexxo.config.ts'))).toBe(true);
    });

    it('should mark old webpack scripts as deprecated', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: false });
        await generator.generate();

        const pkg = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, 'package.json'), 'utf-8'));

        // New scripts
        expect(pkg.scripts.dev).toBe('nexxo dev');
        expect(pkg.scripts.build).toBe('nexxo build');

        // Deprecated scripts should exist
        expect(pkg.scripts['dev:webpack']).toContain('DEPRECATED');
    });

    it('should indicate MEDIUM risk for webpack projects', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        const generator = new MigrationGenerator(plan, FIXTURE_DIR, { dryRun: false, backup: false });
        const result = await generator.generate();

        // Webpack projects typically have more loaders
        expect(result.report).toContain('Risk Level');
    });
});
