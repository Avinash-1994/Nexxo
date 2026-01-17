import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const _require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let native: any;
try {
    const candidates = [
        path.resolve(__dirname, '../../nexxo_native.node'),
        path.resolve(__dirname, '../nexxo_native.node'),
        path.resolve(__dirname, './nexxo_native.node'),
        path.resolve(process.cwd(), 'nexxo_native.node')
    ];

    let found = '';
    for (const c of candidates) {
        if (fs.existsSync(c)) {
            found = c;
            break;
        }
    }

    if (found) {
        native = _require(found);
    } else {
        throw new Error('Native binary not found');
    }
} catch (e) {
    // Fallback Mock
    native = {
        GraphAnalyzer: class { },
        BuildOrchestrator: class { },
        BuildCache: class { },
        fastHash: (s: string) => s,
        batchHash: (sa: string[]) => sa,
        scanImports: (s: string) => [],
        normalizePath: (s: string) => s,
        PluginRuntime: class { },
        NativeWorker: class {
            constructor() { }
            processFile() { return null; }
        },
        helloRust: () => "Mock"
    };
}

export const {
    GraphAnalyzer,
    BuildOrchestrator,
    BuildCache,
    fastHash,
    batchHash,
    scanImports,
    normalizePath,
    PluginRuntime,
    NativeWorker,
    helloRust
} = native;

export { NativeWorker as RustNativeWorker };
export default native;
