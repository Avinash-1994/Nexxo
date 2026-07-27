/**
 * @lunx/security — Supply Chain Security
 * S1.1 SBOM, S1.2 Lockfile Audit, S1.3 CVE Scan
 * Additive only. Zero public API surface change.
 */

export { generateSBOM, type SBOMComponent, type SBOMReport } from './sbom.js';
export { auditLockfile, type LockfileAuditResult } from './lockfile-audit.js';
export { scanCVE, type CVEReport, type CVEFinding } from './cve-scan.js';
export { scanSecrets, type SecretScanResult } from './secret-scanner.js';
export { createPluginPermissionProxy, type PluginPermissions } from './plugin-permissions.js';
export { freezeEnv, guardEnvAccess } from './env-guard.js';
export { generateSRI, injectSRIIntoHTML, type SRIManifest } from './sri.js';
export { generateCSP, type CSPConfig } from './csp.js';
export { generateSecurityHeaders, type SecurityHeaders } from './headers.js';
export { isolateBuildEnv } from './build-isolation.js';
