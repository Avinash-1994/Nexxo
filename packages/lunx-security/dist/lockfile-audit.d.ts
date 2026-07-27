/**
 * S1.2 — Lockfile Integrity Audit
 * Parses package-lock.json and verifies checksums against npm registry.
 * Aborts on mismatch with a clear security message.
 */
export interface LockfilePackage {
    name: string;
    version: string;
    integrity?: string;
    resolved?: string;
}
export interface LockfileAuditResult {
    clean: boolean;
    checked: number;
    violations: {
        name: string;
        version: string;
        expected: string;
        found: string;
    }[];
}
/**
 * Audit the lockfile for tampered packages.
 * Currently supports package-lock.json v2/v3.
 */
export declare function auditLockfile(projectRoot: string): Promise<LockfileAuditResult>;
