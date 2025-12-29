import fs from 'fs/promises';
import path from 'path';
import { FrameworkDetector } from '../dist/core/framework-detector.js';
import { loadConfig } from '../dist/config/index.js';
import { log } from '../dist/utils/logger.js';

// Mock logger
log.info = () => { };
log.warn = () => { };
log.error = () => { };

async function runTests() {
    const testDir = path.join(process.cwd(), 'temp_integration_tests');
    await fs.mkdir(testDir, { recursive: true });

    const tests = [
        {
            name: 'React Framework Detection',
            setup: async (dir: string) => {
                await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({
                    dependencies: { react: '^18.2.0' }
                }));
            },
            verify: async (dir: string) => {
                const detector = new FrameworkDetector(dir);
                const frameworks = await detector.detect();
                return frameworks[0]?.name === 'react';
            }
        },
        {
            name: 'SPA Preset Application',
            setup: async (dir: string) => {
                await fs.writeFile(path.join(dir, 'urja.build.json'), JSON.stringify({
                    preset: 'spa',
                    entry: ['src/index.tsx']
                }));
            },
            verify: async (dir: string) => {
                const config = await loadConfig(dir);
                return config.preset === 'spa' && config.platform === 'browser';
            }
        },
        {
            name: 'SSR Preset Application',
            setup: async (dir: string) => {
                await fs.writeFile(path.join(dir, 'urja.build.json'), JSON.stringify({
                    preset: 'ssr',
                    entry: ['src/entry-server.tsx']
                }));
            },
            verify: async (dir: string) => {
                const config = await loadConfig(dir);
                return config.preset === 'ssr' && config.platform === 'node';
            }
        },
        {
            name: 'Auto-Detection with Default SPA Preset',
            setup: async (dir: string) => {
                await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({
                    dependencies: { react: '^18.0.0' }
                }));
            },
            verify: async (dir: string) => {
                const config = await loadConfig(dir);
                return config.preset === 'spa';
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
