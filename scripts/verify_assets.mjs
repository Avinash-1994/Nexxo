#!/usr/bin/env node
/**
 * Manual verification script for Asset Pipeline
 * Creates a test project, builds it, and verifies the output
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verify() {
    console.log('🔍 Verifying Asset Pipeline...\n');

    const testDir = path.join(__dirname, '..', 'test_asset_verify');

    try {
        // Create test directory
        await fs.mkdir(path.join(testDir, 'src'), { recursive: true });
        await fs.mkdir(path.join(testDir, 'public'), { recursive: true });

        // Create a test image (1x1 red pixel PNG)
        const redPixelPng = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
            0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00,
            0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        await fs.writeFile(path.join(testDir, 'src', 'logo.png'), redPixelPng);

        // Create test entry point
        const entryContent = `import logo from './logo.png';
console.log('Logo path:', logo);
export default logo;
`;
        await fs.writeFile(path.join(testDir, 'src', 'main.js'), entryContent);

        // Create index.html
        await fs.writeFile(path.join(testDir, 'public', 'index.html'),
            '<html><body><h1>Test</h1></body></html>');

        // Create config
        const config = {
            root: ".",
            entry: ["src/main.js"],
            mode: "development",
            outDir: "dist",
            port: 5173
        };
        await fs.writeFile(path.join(testDir, 'urja.build.json'),
            JSON.stringify(config, null, 2));

        console.log('✓ Created test project');
        console.log('  - src/logo.png (1x1 red pixel)');
        console.log('  - src/main.js (imports logo)');

        // Run build
        console.log('\n🔨 Running build...\n');
        const buildCmd = `cd ${testDir} && node ${path.join(__dirname, '..', 'dist', 'cli.js')} build`;
        execSync(buildCmd, { stdio: 'inherit' });

        // Verify output
        console.log('\n✅ Verifying output...\n');

        const distDir = path.join(testDir, 'dist');
        const assetsDir = path.join(distDir, 'assets');

        // Check assets directory
        try {
            await fs.access(assetsDir);
            console.log('✓ Assets directory exists');
        } catch {
            throw new Error('Assets directory not found!');
        }

        // Check for hashed PNG
        const assetFiles = await fs.readdir(assetsDir);
        const pngFiles = assetFiles.filter(f => f.endsWith('.png'));

        if (pngFiles.length === 0) {
            throw new Error('No PNG files found in assets directory!');
        }

        console.log(`✓ Found hashed asset: ${pngFiles[0]}`);

        // Check bundle
        const jsFiles = await fs.readdir(distDir);
        const bundleFiles = jsFiles.filter(f => f.endsWith('.js') && !f.endsWith('.map'));

        if (bundleFiles.length === 0) {
            throw new Error('No JS bundle found!');
        }

        const bundleContent = await fs.readFile(path.join(distDir, bundleFiles[0]), 'utf-8');
        if (!bundleContent.includes('/assets/')) {
            throw new Error('Bundle does not reference /assets/ directory!');
        }

        console.log(`✓ Bundle references assets correctly`);

        console.log('\n🎉 Asset Pipeline Verification PASSED!\n');

    } catch (error) {
        console.error('\n❌ Verification FAILED:', error.message);
        process.exit(1);
    } finally {
        // Cleanup
        try {
            await fs.rm(testDir, { recursive: true, force: true });
            console.log('🧹 Cleaned up test directory\n');
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

verify();
