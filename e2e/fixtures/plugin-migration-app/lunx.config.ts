// e2e/fixtures/plugin-migration-app/lunx.config.ts

// 5 rewritten TS hooks that previously were Wasmtime plugins
export default {
    plugins: [
        {
            name: 'former-wasm-plugin-1',
            manifest: { name: 'wasm1', version: '1.0.0', type: 'js', engineVersion: '^1.0.0', hooks: ['buildStart'] },
            runHook: (hook) => {
                if (hook === 'buildStart') console.log('Hook 1: buildStart fired');
            }
        },
        {
            name: 'former-wasm-plugin-2',
            manifest: { name: 'wasm2', version: '1.0.0', type: 'js', engineVersion: '^1.0.0', hooks: ['resolveId'] },
            runHook: (hook, id) => {
                if (hook === 'resolveId' && id === 'virtual:test') return 'virtual:test-resolved';
                return null; // Return null so pipeline continues
            }
        },
        {
            name: 'former-wasm-plugin-3',
            manifest: { name: 'wasm3', version: '1.0.0', type: 'js', engineVersion: '^1.0.0', hooks: ['load'] },
            runHook: (hook, id) => {
                if (hook === 'load' && id === 'virtual:test-resolved') return 'export const test = true;';
                return null;
            }
        },
        {
            name: 'former-wasm-plugin-4',
            manifest: { name: 'wasm4', version: '1.0.0', type: 'js', engineVersion: '^1.0.0', hooks: ['transform'] },
            runHook: (hook, code, id) => {
                return null; 
            }
        },
        {
            name: 'former-wasm-plugin-5',
            manifest: { name: 'wasm5', version: '1.0.0', type: 'js', engineVersion: '^1.0.0', hooks: ['buildEnd'] },
            runHook: (hook) => {
                if (hook === 'buildEnd') console.log('Hook 5: buildEnd fired');
            }
        }
    ]
};
