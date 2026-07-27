/**
 * @lunx/security — Supply Chain Security
 * S1.1 SBOM, S1.2 Lockfile Audit, S1.3 CVE Scan
 * Additive only. Zero public API surface change.
 */
export { generateSBOM } from './sbom.js';
export { auditLockfile } from './lockfile-audit.js';
export { scanCVE } from './cve-scan.js';
export { scanSecrets } from './secret-scanner.js';
export { createPluginPermissionProxy } from './plugin-permissions.js';
export { freezeEnv, guardEnvAccess } from './env-guard.js';
export { generateSRI, injectSRIIntoHTML } from './sri.js';
export { generateCSP } from './csp.js';
export { generateSecurityHeaders } from './headers.js';
export { isolateBuildEnv } from './build-isolation.js';
