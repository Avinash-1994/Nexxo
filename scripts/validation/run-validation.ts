
import { CoreBuildEngine } from '../../src/core/engine/index.js';
import { BuildConfig } from '../../src/config/index.js';
import path from 'path';
import fs from 'fs/promises';
import { strict as assert } from 'assert';

const BASE_DIR = path.resolve(process.cwd(), 'tests/validation/temp');

// --- Helper Utilities ---

async function setup() {
    await fs.rm(BASE_DIR, { recursive: true, force: true });
    await fs.mkdir(BASE_DIR, { recursive: true });
}

async function createFile(relPath: string, content: string) {
    const p = path.join(BASE_DIR, relPath);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, content);
}

async function runBuild(name: string, config: BuildConfig): Promise<any> {
    console.log(`\n📋 [${name}] Starting Build...`);
    const engine = new CoreBuildEngine();
    // Use 'build' mode for production-like consistency validation
    const result = await engine.run(config, 'build', path.resolve(BASE_DIR, config.root || '.'));

    if (!result.success) {
        console.error(`❌ [${name}] Failed:`, result.error);
        throw new Error(`Build failed for ${name}`);
    }

    console.log(`✅ [${name}] Success! (${result.artifacts?.length} artifacts)`);
    return result;
}

// --- Scenarios ---

// Scenario 1: Kitchen Sink Monorepo
async function scenarioKitchenSink() {
    console.log('\n--- 🏗️ SCENARIO 1: The Kitchen Sink Monorepo ---');

    const root = path.join(BASE_DIR, 'kitchen-sink');
    await fs.mkdir(root, { recursive: true });

    // 1. Create structure
    await createFile('kitchen-sink/packages/utils/package.json', JSON.stringify({ name: '@monorepo/utils', main: 'index.js' }));
    await createFile('kitchen-sink/packages/utils/index.js', `
        exports.formatDate = (d) => new Date(d).toISOString();
        exports.PI = 3.14159;
    `);

    await createFile('kitchen-sink/packages/ui/package.json', JSON.stringify({ name: '@monorepo/ui', type: 'module', main: 'index.js' }));
    await createFile('kitchen-sink/packages/ui/index.js', `
        import { formatDate } from '../utils/index.js'; 
        export const Button = (label) => \`<button reset="\${formatDate(Date.now())}">\${label}</button>\`;
    `);

    await createFile('kitchen-sink/apps/web/package.json', JSON.stringify({ name: 'web-app', type: 'module' }));
    await createFile('kitchen-sink/apps/web/main.js', `
        import { Button } from '../../packages/ui/index.js';
        import { PI } from '../../packages/utils/index.js';
        console.log("App Started", Button("Click Me"), PI);
    `);

    const config: BuildConfig = {
        root: root,
        entry: ['apps/web/main.js'],
        mode: 'production',
        outDir: 'dist',
        platform: 'browser',
        port: 3000,
        preset: 'spa',
        build: { splitting: true, minify: false }
    };

    // 2. Build
    const result = await runBuild('KitchenSink-Run1', config);

    // 3. Verify Content
    const artifact = result.artifacts?.find((a: any) => a.fileName.includes('main.bundle.js'));
    console.log('[DEBUG_VALIDATION] Bundle Size:', artifact?.source.length);
    console.log('[DEBUG_VALIDATION] Bundle End Snippet:', artifact?.source.substring(artifact.source.length - 1000));
    assert.ok(artifact, 'Main bundle must exist');
    assert.ok(artifact.source.includes('exports.formatDate'), 'Should include CJS source');
    // ESM 'export const Button' is transformed by esbuild's CJS pass
    assert.ok(artifact.source.includes('Button:') || artifact.source.includes('exports.Button'), 'Should include transformed ESM source');

    return { result, config };
}

// Scenario 2: Legacy Nightmare (Interop Torture)
async function scenarioLegacy() {
    console.log('\n--- 🦕 SCENARIO 2: The Legacy Nightmare ---');

    const root = path.join(BASE_DIR, 'legacy');
    await fs.mkdir(root, { recursive: true });

    await createFile('legacy/bad-lib.js', `
        var internal = "secret";
        module.exports = function() { return internal; };
        module.exports.foo = "bar";
        Object.defineProperty(exports, "live", { get: () => Date.now() });
    `);

    await createFile('legacy/main.mjs', `
        import badLib, { foo, live } from './bad-lib.js';
        console.log(badLib(), foo, live);
    `);

    const config: BuildConfig = {
        root: root,
        entry: ['main.mjs'],
        mode: 'production',
        outDir: 'dist',
        platform: 'node',
        port: 3000,
        preset: 'spa',
        build: { minify: false }
    };

    const result = await runBuild('Legacy-Interop', config);
    const bundle = result.artifacts?.[0].source;

    assert.ok(bundle.includes('var internal = "secret"'), 'Legacy lib content included');
}

// Scenario 3: Determinism Loop
async function scenarioDeterminism(baselineData: { result: any, config: BuildConfig }) {
    console.log('\n--- 🔄 SCENARIO 3: Determinism Loop (5x) ---');

    const { result: baselineResult, config } = baselineData;

    for (let i = 0; i < 5; i++) {
        const result = await runBuild(`Determinism-${i + 1}`, config);

        assert.equal(result.fingerprint.inputHash, baselineResult.fingerprint.inputHash, `Run ${i + 1}: Input hash mismatch`);
        assert.equal(result.fingerprint.graphHash, baselineResult.fingerprint.graphHash, `Run ${i + 1}: Graph hash mismatch`);
        assert.equal(result.fingerprint.planHash, baselineResult.fingerprint.planHash, `Run ${i + 1}: Plan hash mismatch`);
        assert.equal(result.fingerprint.outputHash, baselineResult.fingerprint.outputHash, `Run ${i + 1}: Output hash mismatch`);
    }
    console.log('✅ Determinism Perfect across 5 runs.');
}

// Scenario 4: Butterfly Effect (Sensitivity)
async function scenarioSensitivity(baselineData: { result: any, config: BuildConfig }) {
    console.log('\n--- 🦋 SCENARIO 4: Change Sensitivity ---');

    const { result: baselineResult, config } = baselineData;

    // Change deep dependency in the isolated kitchen-sink folder
    const utilsPath = path.join(config.root, 'packages/utils/index.js');
    const content = await fs.readFile(utilsPath, 'utf-8');
    await fs.writeFile(utilsPath, content + '\nexports.NEW_FEATURE = true;');

    const result = await runBuild('Sensitivity-Run', config);

    assert.notEqual(result.fingerprint.inputHash, baselineResult.fingerprint.inputHash, 'Input hash MUST change');
    assert.notEqual(result.fingerprint.outputHash, baselineResult.fingerprint.outputHash, 'Output hash MUST change');

    console.log('✅ Sensitivity Verified: Deep change cascaded to output hash.');
}

async function runValidation() {
    await setup();

    // 1. Kitchen Sink (Baseline)
    const baselineData = await scenarioKitchenSink();

    // 2. Legacy Interop
    await scenarioLegacy();

    // 3. Determinism
    await scenarioDeterminism(baselineData);

    // 4. Sensitivity
    await scenarioSensitivity(baselineData);

    console.log('\n🎉 ALL VALIDATION SCENARIOS PASSED.');
}

runValidation().catch(e => {
    console.error('\n🔴 VALIDATION FAILED');
    console.error(e);
    process.exit(1);
});
