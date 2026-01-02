export interface AdapterOptions {
    root: string;
    entryPoints: string[];
    mode: 'dev' | 'prod';
    env: Record<string, string>;
    outputDir: string;
}

export interface AdapterOutput {
    assets: {
        fileName: string;
        source: string | Uint8Array;
        type: 'js' | 'css' | 'asset';
    }[];
    manifest: Record<string, string>; // Source path -> Output path
}

export interface HMREvent {
    type: 'update' | 'create' | 'delete';
    file: string;
}

export interface FrameworkAdapter {
    name: string;

    init(options: AdapterOptions): Promise<void>;
    build(): Promise<AdapterOutput>; // Handles both dev (initial) and prod
    handleHmr(event: HMREvent): Promise<{ type: 'reload' | 'update', modules: string[] }>;
}
