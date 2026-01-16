/**
 * Migration Analyzer Tests - Webpack Projects (Day 43)
 */

import { describe, it, expect, beforeAll, afterAll } from '../src/test/api.js';
import { MigrationAnalyzer } from '../src/migrate/analyzer.js';
import fs from 'fs';
import path from 'path';

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures/migrate_webpack');

describe('Migration Analyzer - Webpack', () => {
    beforeAll(async () => {
        // Create Webpack React fixture
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(path.join(FIXTURE_DIR, 'src'), { recursive: true });

        // package.json
        fs.writeFileSync(path.join(FIXTURE_DIR, 'package.json'), JSON.stringify({
            name: 'webpack-react-app',
            dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0',
                'styled-components': '^6.0.0'
            },
            devDependencies: {
                'webpack': '^5.88.0',
                'webpack-cli': '^5.1.0',
                'webpack-dev-server': '^4.15.0',
                'babel-loader': '^9.1.0',
                'css-loader': '^6.8.0',
                'style-loader': '^3.3.0',
                'sass-loader': '^13.3.0',
                'sass': '^1.64.0',
                'file-loader': '^6.2.0',
                'html-webpack-plugin': '^5.5.0'
            }
        }, null, 2));

        // webpack.config.js
        fs.writeFileSync(path.join(FIXTURE_DIR, 'webpack.config.js'), `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\\.jsx?$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      { test: /\\.(png|jpg|gif)$/, use: 'file-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' })
  ],
  devServer: {
    port: 8080
  }
};
        `);

        // src/index.js
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/index.js'), `
import React from 'react';
import ReactDOM from 'react-dom/client';
import styled from 'styled-components';
import './styles.scss';

const Title = styled.h1\`color: blue;\`;

ReactDOM.createRoot(document.getElementById('root')).render(<Title>Hello</Title>);
        `);

        // src/styles.scss
        fs.writeFileSync(path.join(FIXTURE_DIR, 'src/styles.scss'), `
$primary: #333;
body { color: $primary; }
        `);

        // public/index.html
        fs.mkdirSync(path.join(FIXTURE_DIR, 'public'), { recursive: true });
        fs.writeFileSync(path.join(FIXTURE_DIR, 'public/index.html'), `
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
  </body>
</html>
        `);
    });

    afterAll(async () => {
        if (fs.existsSync(FIXTURE_DIR)) {
            fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        }
    });

    it('should detect Webpack toolchain', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.toolchainType).toBe('webpack');
    });

    it('should detect React framework', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.frameworks).toContain('react');
    });

    it('should detect Sass', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.cssSetup.hasSass).toBe(true);
    });

    it('should detect CSS-in-JS (styled-components)', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.cssSetup.hasCSSInJS).toBe(true);
        expect(plan.cssSetup.cssInJSLibrary).toBe('styled-components');
    });

    it('should detect webpack loaders', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.loaders.length).toBeGreaterThan(0);
        expect(plan.loaders).toContain('babel-loader');
        expect(plan.loaders).toContain('css-loader');
        expect(plan.loaders).toContain('sass-loader');
    });

    it('should have MEDIUM risk level for complex webpack project', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        // 8 loaders + 1 plugin = 9 customizations -> MEDIUM
        expect(plan.riskLevel).toBe('MEDIUM');
    });

    it('should identify manual steps for complex loaders', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.manualSteps.some(step => step.includes('asset handling'))).toBe(true);
    });

    it('should detect entry point', async () => {
        const analyzer = new MigrationAnalyzer(FIXTURE_DIR);
        const plan = await analyzer.analyze();

        expect(plan.projectStructure.entryPoints.length).toBeGreaterThan(0);
    });
});
