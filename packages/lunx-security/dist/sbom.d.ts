/**
 * S1.1 — Software Bill of Materials (CycloneDX 1.5)
 * Generates dist/lunx-sbom.json listing every npm + Rust dep
 * that contributed code to the final output bundle.
 */
export interface SBOMComponent {
    type: 'library';
    name: string;
    version: string;
    purl: string;
    licenses: string[];
    hashes: {
        alg: 'SHA-256';
        content: string;
    }[];
    externalReferences?: {
        type: string;
        url: string;
    }[];
}
export interface SBOMReport {
    bomFormat: 'CycloneDX';
    specVersion: '1.5';
    serialNumber: string;
    version: number;
    metadata: {
        timestamp: string;
        tools: {
            name: string;
            version: string;
        }[];
    };
    components: SBOMComponent[];
}
/**
 * Walk resolved dependency graph and generate CycloneDX 1.5 SBOM.
 * @param projectRoot – root of the Lunx project
 * @param resolvedModules – list of resolved npm package names (from dep graph)
 */
export declare function generateSBOM(projectRoot: string, resolvedModules?: string[]): Promise<SBOMReport>;
/** Write the SBOM to dist/lunx-sbom.json */
export declare function writeSBOM(report: SBOMReport, distDir: string): void;
