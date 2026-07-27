/**
 * S3.1 — Subresource Integrity (SRI) hashes
 * Generates sha384 hashes for every script and link tag in output HTML.
 * Injects integrity + crossorigin="anonymous" into all script/link tags.
 */
export type SRIManifest = Record<string, string>;
/** Compute sha384 SRI hash for a buffer or string. */
export declare function computeSRI(content: Buffer | string): string;
/**
 * Generate SRI manifest for all JS and CSS assets in the dist directory.
 */
export declare function generateSRI(distDir: string): SRIManifest;
/**
 * Inject integrity and crossorigin attributes into HTML script/link tags.
 */
export declare function injectSRIIntoHTML(html: string, manifest: SRIManifest): string;
