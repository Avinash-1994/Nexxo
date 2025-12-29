import { loadConfig } from '../dist/config/index.js';
import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';

async function testYamlConfig() {
    console.log('Running YAML Config Test...');
    const cwd = process.cwd();
    const yamlPath = path.join(cwd, 'urja.build.yaml');

    const yamlContent = `
root: .
entry: 
  - src/main.tsx
mode: production
outDir: dist_yaml
port: 4000
`;

    try {
        // Create dummy yaml config
        await fs.writeFile(yamlPath, yamlContent);

        // Load config
        const config = await loadConfig(cwd);

        // Verify
        assert.strictEqual(config.mode, 'production');
        assert.strictEqual(config.port, 4000);
        assert.strictEqual(config.outDir, 'dist_yaml');

        console.log('YAML Config Test Passed!');
    } catch (error) {
        console.error('YAML Config Test Failed:', error);
        process.exit(1);
    } finally {
        // Cleanup
        await fs.unlink(yamlPath).catch(() => { });
    }
}

testYamlConfig();
