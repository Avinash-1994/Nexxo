
// Module 6: Plugin System Types (LOCKED SPEC)

/** @public */
export type PluginHookName =
    | 'beforeGraph'
    | 'afterGraph'
    | 'beforePlan'
    | 'afterPlan'
    | 'transformModule'
    | 'resolveId'
    | 'load'
    | 'renderChunk'
    | 'cssPrecedence'
    | 'cssTreeShake'
    | 'analyzeBuild'
    | 'buildEnd';

/** @public */
export type PluginType = 'js' | 'wasm';

/** @public */
export interface PluginManifest {
    name: string;
    version: string;
    engineVersion: string;
    type: PluginType;
    hooks: PluginHookName[];
    permissions: {
        fs?: 'read' | 'none';
        network?: 'none';
    };
}

/** @internal */
export interface PluginValidation {
    passesDeterminism: boolean;
    executionTimeMs: number;
    outputSizeBytes: number;
    mutationScore: number; // 0 = pure, >0 = suspicious
}

/** @internal */
export interface PluginExecutionRecord {
    pluginId: string;
    hook: PluginHookName;
    inputHash: string;
    outputHash: string;
    validation: PluginValidation;
}

/** @public */
export interface UrjaPlugin {
    manifest: PluginManifest;
    id: string; // sha256(name + version)

    // Hook implementations
    runHook(hook: PluginHookName, input: any, context?: any): Promise<any>;
}

