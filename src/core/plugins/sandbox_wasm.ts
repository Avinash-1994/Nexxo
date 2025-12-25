
import { UrjaPlugin, PluginHookName, PluginManifest } from './types.js';
import { canonicalHash } from '../engine/hash.js';

export class WASMPluginSandbox implements UrjaPlugin {
    manifest: PluginManifest;
    id: string;
    private instance: WebAssembly.Instance;
    private memory: WebAssembly.Memory;

    constructor(wasmBuffer: Buffer, manifest: PluginManifest, instance: WebAssembly.Instance) {
        this.manifest = manifest;
        this.id = canonicalHash(`${manifest.name}@${manifest.version}`);
        this.instance = instance;
        this.memory = (instance.exports.memory as WebAssembly.Memory);
    }

    static async create(wasmBuffer: Buffer): Promise<WASMPluginSandbox> {
        const memory = new WebAssembly.Memory({ initial: 10, maximum: 100 });

        // 6.4 B) No FS / network imports
        const importObject = {
            env: {
                memory: memory,
                abort: () => { throw new Error("WASM Plugin Aborted"); }
            }
        };

        const { instance } = await WebAssembly.instantiate(wasmBuffer, importObject);

        // 6.5 ABI Initialization
        const exports = instance.exports as any;
        if (exports._init) {
            exports._init();
        }

        // Extraction of manifest from WASM
        let manifest: PluginManifest;
        if (exports._get_manifest) {
            const ptr = exports._get_manifest();
            manifest = JSON.parse(readString(memory, ptr));
        } else {
            throw new Error("WASM Plugin missing _get_manifest");
        }

        return new WASMPluginSandbox(wasmBuffer, manifest, instance);
    }

    async runHook(hookName: PluginHookName, input: any): Promise<any> {
        const exports = this.instance.exports as any;

        if (!exports._run_hook) return input;

        const inputJson = JSON.stringify(input);
        const inputPtr = writeString(this.memory, exports, inputJson);
        const hookNamePtr = writeString(this.memory, exports, hookName);

        const resultPtr = exports._run_hook(hookNamePtr, inputPtr, inputJson.length);

        const resultJson = readString(this.memory, resultPtr);

        // In real ABI, we'd need to free strings here if WASM provides free()

        return JSON.parse(resultJson);
    }
}

// Helpers for WASM string interop
function readString(memory: WebAssembly.Memory, ptr: number): string {
    const bytes = new Uint8Array(memory.buffer, ptr);
    let end = ptr;
    while (bytes[end] !== 0) end++; // C-style null terminated
    return new TextDecoder().decode(bytes.slice(ptr, end));
}

function writeString(memory: WebAssembly.Memory, exports: any, str: string): number {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);

    // If WASM exports malloc, use it. Otherwise we are in trouble or use a fixed buffer.
    const ptr = exports.malloc ? exports.malloc(bytes.length + 1) : 0;
    if (ptr === 0 && exports.malloc) throw new Error("WASM out of memory");

    const view = new Uint8Array(memory.buffer, ptr, bytes.length + 1);
    view.set(bytes);
    view[bytes.length] = 0; // null terminate

    return ptr;
}
