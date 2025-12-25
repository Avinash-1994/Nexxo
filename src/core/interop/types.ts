
// Phase 1: Core Types, Concepts & Enums for Interop

export type ModuleFormat = 'esm' | 'cjs' | 'json' | 'unknown';

export type ExportMap = {
    named: Set<string>;
    hasDefault: boolean;
    isDynamic: boolean;
    liveBindings: boolean;
    reexports: Record<string, string>; // export * from "x"
};

export type InteropStats = {
    wrappersGenerated: number;
    treeShakeableWrappers: number;
    bytesOverhead: number;
    problematicModules: string[];
};

export interface InteropAnalysis {
    format: ModuleFormat;
    exports: ExportMap;
    // Which conditional export key was selected for this environment? e.g. 'import' or 'require'
    conditionSelected?: string;
    // If we need a wrapper, this is its content
    wrapperContent?: string;
}

export type ConditionalExport =
    | string
    | { [condition: string]: ConditionalExport }
    | ConditionalExport[];

// The canonical internal shape every module is normalized into at runtime/bundling
export interface CanonicalModuleShape {
    namespace: Record<string, any>;
    defaultExport: any;
    liveBindings: boolean;
}
