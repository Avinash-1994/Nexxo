/**
 * S2.2 — Secret Scanner
 * Scans all emitted bundle text for leaked secrets before writing dist/.
 * Runs as a Rust-speed regex pass over every output file's content.
 * NEVER prints the actual secret value.
 */
export interface SecretPattern {
    name: string;
    pattern: RegExp;
}
export interface SecretScanResult {
    clean: boolean;
    violations: {
        file: string;
        patternName: string;
        lineNumber: number;
    }[];
}
/** Default secret detection patterns (S2.2 spec) */
export declare const DEFAULT_SECRET_PATTERNS: SecretPattern[];
/**
 * Scan output files for secrets before writing to dist/.
 * @param files – map of output filePath → fileContent
 * @param allowlist – regex patterns to skip (user-defined false-positive suppression)
 * @param logDir – directory to write secret-scan.log
 */
export declare function scanSecrets(files: Record<string, string>, allowlist?: RegExp[], logDir?: string): SecretScanResult;
