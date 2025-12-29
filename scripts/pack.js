#!/usr/bin/env node

/**
 * Pre-pack script to ensure everything is ready for npm publishing
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Running pre-pack checks...\n');

const requiredFiles = [
    'dist/cli.js',
    'dist/urja_native.node',
    'README.md',
    'LICENSE',
    'package.json'
];

let hasErrors = false;

for (const file of requiredFiles) {
    const filePath = join(rootDir, file);
    if (existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.error(`❌ Missing: ${file}`);
        hasErrors = true;
    }
}

if (hasErrors) {
    console.error('\n❌ Pre-pack checks failed. Please build the project first:');
    console.error('   npm run build');
    process.exit(1);
}

console.log('\n✅ All pre-pack checks passed!');
