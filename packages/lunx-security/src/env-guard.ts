/**
 * S2.3 — Environment Variable Guard (plugin-facing)
 * Manages filtered env exposure for plugins without env:read permission.
 */

export { freezeEnv, guardEnvAccess, isolateBuildEnv } from './build-isolation.js';
