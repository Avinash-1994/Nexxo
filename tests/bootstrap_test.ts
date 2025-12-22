import fs from 'fs/promises';
import path from 'path';
import { detectBootstrapUsage, getBootstrapConfig, injectBootstrapCDN } from '../dist/plugins/css/bootstrap.js';

async function runTests() {
    const testDir = path.join(process.cwd(), 'temp_bootstrap_tests');
    await fs.mkdir(testDir, { recursive: true });

    const tests = [
        {
            name: 'Detect Bootstrap in package.json',
            setup: async (dir: string) => {
                await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({
                    dependencies: { bootstrap: '^5.3.0' }
                }));
            },
            verify: async (dir: string) => {
                const detected = await detectBootstrapUsage(dir);
                return detected === true;
            }
        },
        {
            name: 'Detect Bootstrap Icons in package.json',
            setup: async (dir: string) => {
                await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({
                    devDependencies: { 'bootstrap-icons': '^1.11.0' }
                }));
            },
            verify: async (dir: string) => {
                const detected = await detectBootstrapUsage(dir);
                return detected === true;
            }
        },
        {
            name: 'No Bootstrap detected',
            setup: async (dir: string) => {
                await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({
                    dependencies: { lodash: '1.0.0' }
                }));
            },
            verify: async (dir: string) => {
                const detected = await detectBootstrapUsage(dir);
                return detected === false;
            }
        },
        {
            name: 'Get Bootstrap config (CDN fallback)',
            setup: async (dir: string) => {
                await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({}));
            },
            verify: async (dir: string) => {
                const config = await getBootstrapConfig(dir);
                return config.useCDN === true;
            }
        },
        {
            name: 'Inject Bootstrap CDN into HTML',
            setup: async () => { },
            verify: async () => {
                const html = '<html><head></head><body></body></html>';
                const result = injectBootstrapCDN(html);
                return result.includes('bootstrap.min.css') &&
                    result.includes('bootstrap.bundle.min.js') &&
                    result.includes('bootstrap-icons');
            }
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const caseDir = path.join(testDir, test.name.replace(/[^a-z0-9]/gi, '_'));
        await fs.mkdir(caseDir, { recursive: true });
        await test.setup(caseDir);

        try {
            const result = await test.verify(caseDir);
            if (result) {
                console.log(`✅ ${test.name} passed`);
                passed++;
            } else {
                console.error(`❌ ${test.name} failed`);
                failed++;
            }
        } catch (error) {
            console.error(`❌ ${test.name} failed with error:`, error);
            failed++;
        }
    }

    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
