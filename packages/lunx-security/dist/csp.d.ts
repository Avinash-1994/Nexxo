/**
 * S3.2 — Content Security Policy (CSP) Generation
 * Generates a strict CSP header based on what the build actually emits.
 * No manual CSP writing required.
 */
export interface CSPConfig {
    directives?: Record<string, string[]>;
    reportUri?: string;
    cdnOrigins?: string[];
}
export interface CSPResult {
    header: string;
    metaTag: string;
}
/**
 * Generate a strict CSP from the production build output.
 * @param distDir – path to dist directory
 * @param config – optional user overrides
 */
export declare function generateCSP(distDir: string, config?: CSPConfig): CSPResult;
