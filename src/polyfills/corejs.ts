
/**
 * Nexxo Legacy Polyfill Injector
 * Day 25: Legacy Polyfills & Windows Lock
 */

export const CORE_JS_IMPORT = "import 'core-js/stable'; import 'regenerator-runtime/runtime';";

export class PolyfillInjector {
    static shouldInject(targets: string[]): boolean {
        // Simple heuristic: if 'ie 11' or 'legacy' is in targets
        return targets.some(t => t.includes('ie') || t.includes('legacy') || t.includes('es5'));
    }

    static transform(code: string, targets: string[]): string {
        if (this.shouldInject(targets)) {
            // Prepend imports
            return `${CORE_JS_IMPORT}\n${code}`;
        }
        return code;
    }
}
