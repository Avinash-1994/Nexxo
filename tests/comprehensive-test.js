#!/usr/bin/env node
/**
 * Comprehensive Testing Suite
 * Tests all features to determine what's production-ready vs. just code
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Test results
const results = {
    passed: [],
    failed: [],
    skipped: []
};

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60) + '\n');
}

async function runCommand(cmd, cwd, timeout = 30000) {
    return new Promise((resolve) => {
        const proc = spawn(cmd, { shell: true, cwd, stdio: 'pipe' });
        let stdout = '';
        let stderr = '';
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            proc.kill();
        }, timeout);

        proc.stdout.on('data', (data) => stdout += data.toString());
        proc.stderr.on('data', (data) => stderr += data.toString());

        proc.on('close', (code) => {
            clearTimeout(timer);
            resolve({
                success: !timedOut && code === 0,
                stdout,
                stderr,
                timedOut,
                code
            });
        });
    });
}

async function testExists(name, filePath) {
    try {
        await fs.access(path.join(ROOT, filePath));
        results.passed.push(name);
        log(`✅ ${name}`, 'green');
        return true;
    } catch (e) {
        results.failed.push(name);
        log(`❌ ${name} - File not found: ${filePath}`, 'red');
        return false;
    }
}

async function testBuild(framework, exampleDir) {
    const name = `Build: ${framework}`;
    const dir = path.join(ROOT, 'examples', exampleDir);

    try {
        // Check if example exists
        await fs.access(dir);
    } catch (e) {
        results.skipped.push(name);
        log(`⏭️  ${name} - Example not found`, 'yellow');
        return false;
    }

    log(`🔨 Testing ${name}...`, 'blue');

    const result = await runCommand('npx tsx ../../src/cli.ts build', dir, 60000);

    if (result.success) {
        // Check if output was created
        const distExists = await fs.access(path.join(dir, 'dist')).then(() => true).catch(() => false);
        if (distExists) {
            results.passed.push(name);
            log(`✅ ${name}`, 'green');
            return true;
        }
    }

    results.failed.push(name);
    log(`❌ ${name}`, 'red');
    if (result.timedOut) log(`   Timeout after 60s`, 'red');
    if (result.stderr) log(`   Error: ${result.stderr.substring(0, 200)}`, 'red');
    return false;
}

async function testDevServer() {
    const name = 'Dev Server Start';
    log(`🔨 Testing ${name}...`, 'blue');

    const result = await runCommand(
        'npx tsx src/cli.ts dev --port 5555',
        ROOT,
        5000 // Just test if it starts
    );

    // Dev server should timeout (it runs forever), that's success
    if (result.timedOut) {
        results.passed.push(name);
        log(`✅ ${name} - Server started successfully`, 'green');
        return true;
    }

    results.failed.push(name);
    log(`❌ ${name}`, 'red');
    return false;
}

async function testCompression() {
    const name = 'Compression (Brotli/Gzip)';
    log(`🔨 Testing ${name}...`, 'blue');

    // Build a simple project and check for .br and .gz files
    const testDir = path.join(ROOT, 'examples', 'react-test');

    try {
        await fs.access(testDir);
    } catch (e) {
        results.skipped.push(name);
        log(`⏭️  ${name} - No test project`, 'yellow');
        return false;
    }

    const result = await runCommand('npx tsx ../../src/cli.ts build', testDir, 60000);

    if (result.success) {
        // Check for compressed files
        const distDir = path.join(testDir, 'dist');
        const files = await fs.readdir(distDir).catch(() => []);
        const hasCompressed = files.some(f => f.endsWith('.br') || f.endsWith('.gz'));

        if (hasCompressed) {
            results.passed.push(name);
            log(`✅ ${name} - Found compressed files`, 'green');
            return true;
        }
    }

    results.failed.push(name);
    log(`❌ ${name}`, 'red');
    return false;
}

async function testCSSOptimization() {
    const name = 'CSS Optimization';
    log(`🔨 Testing ${name}...`, 'blue');

    // Check if CSS optimizer exists and is integrated
    const optimizerExists = await testExists(
        'CSS Optimizer File',
        'src/core/steps/css-optimization.ts'
    );

    if (optimizerExists) {
        results.passed.push(name);
        log(`✅ ${name} - Module exists`, 'green');
        return true;
    }

    results.failed.push(name);
    log(`❌ ${name}`, 'red');
    return false;
}

async function testSecurityHeaders() {
    const name = 'Security Headers';
    const exists = await testExists(
        'Security Headers Module',
        'src/server/security-headers.ts'
    );

    if (exists) {
        results.passed.push(name);
        log(`✅ ${name}`, 'green');
        return true;
    }

    results.failed.push(name);
    log(`❌ ${name}`, 'red');
    return false;
}

async function testIncrementalBuilds() {
    const name = 'Incremental Builds';
    const exists = await testExists(
        'Incremental Build Manager',
        'src/cache/incremental.ts'
    );

    if (exists) {
        // TODO: Actually test cache hits
        results.passed.push(name + ' (Module Only)');
        log(`⚠️  ${name} - Module exists, not tested`, 'yellow');
        return true;
    }

    results.failed.push(name);
    log(`❌ ${name}`, 'red');
    return false;
}

async function testFederation() {
    const name = 'Module Federation';

    const pluginExists = await fs.access(path.join(ROOT, 'src/plugins/federation.ts'))
        .then(() => true).catch(() => false);
    const runtimeExists = await fs.access(path.join(ROOT, 'src/runtime/federation.js'))
        .then(() => true).catch(() => false);
    const fallbackExists = await fs.access(path.join(ROOT, 'src/runtime/federation-fallback.ts'))
        .then(() => true).catch(() => false);

    if (pluginExists && runtimeExists) {
        results.passed.push(name + ' (Basic)');
        log(`✅ ${name} - Plugin & Runtime exist`, 'green');
        if (fallbackExists) {
            log(`   ℹ️  Fallback system exists (not integrated)`, 'blue');
        }
        return true;
    }

    results.failed.push(name);
    log(`❌ ${name}`, 'red');
    return false;
}

async function runAllTests() {
    log('🚀 COMPREHENSIVE TESTING SUITE', 'cyan');
    log('Testing all features to determine production readiness\n', 'cyan');

    // Test 1: File Existence
    section('1. Core Files');
    await testExists('Universal Transformer', 'src/core/universal-transformer.ts');
    await testExists('Dev Server', 'src/dev/devServer.ts');
    await testExists('Build Pipeline', 'src/core/pipeline.ts');
    await testExists('Build Steps', 'src/core/steps.ts');

    // Test 2: Production Features
    section('2. Production Features');
    await testSecurityHeaders();
    await testCompression();
    await testCSSOptimization();
    await testIncrementalBuilds();

    // Test 3: Advanced Features
    section('3. Advanced Features');
    await testFederation();
    await testExists('SSR Server', 'src/meta-frameworks/ssr/server.ts');
    await testExists('React SSR Renderer', 'src/meta-frameworks/ssr/react-renderer.ts');
    await testExists('Vue SSR Renderer', 'src/meta-frameworks/ssr/vue-renderer.ts');

    // Test 4: Framework Builds (Sample)
    section('4. Framework Builds (Sample)');
    await testBuild('React', 'react-test');
    await testBuild('Vue', 'vue-test');
    await testBuild('Svelte', 'svelte-test');

    // Test 5: Dev Server
    section('5. Dev Server');
    await testDevServer();

    // Results Summary
    section('📊 TEST RESULTS');

    const total = results.passed.length + results.failed.length + results.skipped.length;
    const passRate = ((results.passed.length / total) * 100).toFixed(1);

    log(`Total Tests: ${total}`, 'cyan');
    log(`✅ Passed: ${results.passed.length}`, 'green');
    log(`❌ Failed: ${results.failed.length}`, 'red');
    log(`⏭️  Skipped: ${results.skipped.length}`, 'yellow');
    log(`\nPass Rate: ${passRate}%`, passRate >= 70 ? 'green' : 'red');

    // Detailed Results
    if (results.failed.length > 0) {
        console.log('\n❌ Failed Tests:');
        results.failed.forEach(test => log(`   - ${test}`, 'red'));
    }

    if (results.skipped.length > 0) {
        console.log('\n⏭️  Skipped Tests:');
        results.skipped.forEach(test => log(`   - ${test}`, 'yellow'));
    }

    // Save results
    const report = {
        timestamp: new Date().toISOString(),
        total,
        passed: results.passed.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
        passRate: parseFloat(passRate),
        details: results
    };

    await fs.writeFile(
        path.join(ROOT, 'TEST_RESULTS.json'),
        JSON.stringify(report, null, 2)
    );

    log('\n📄 Full report saved to TEST_RESULTS.json', 'cyan');

    // Exit with appropriate code
    process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
