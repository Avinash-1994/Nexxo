import { pathToFileURL } from 'url';
import fs from 'fs';

export interface SsrRenderResult {
    html: string;
    head: string;
    state?: any;
    error?: Error;
}

export interface SsrContext {
    url: string;
    [key: string]: any;
}

/**
 * SSR Runner.
 *
 * The SSR entry (`entry-ssr.js`) is a real ESM module that exports an async
 * `render(context)` function returning `{ html, head, state }`. Older versions
 * of this runner tried to evaluate the entry inside a `vm.Script` wrapped in a
 * CommonJS closure — that fails at parse time for any entry using ESM `import`
 * syntax (which all of ours do), silently returning empty HTML.
 *
 * We now load the entry with a genuine dynamic `import()` so that
 * `import.meta.url`, `createRequire`, and relative `require()` calls inside the
 * entry all resolve against the fixture, exactly as they would at runtime.
 */
export class SsrRunner {
    async renderToString(
        entryPath: string,
        context: SsrContext,
        options: Record<string, any> = {}
    ): Promise<SsrRenderResult> {
        try {
            // Ensure the file exists before importing so we return a clean error
            // rather than an opaque ERR_MODULE_NOT_FOUND.
            await fs.promises.access(entryPath);

            const href = pathToFileURL(entryPath).href;
            const mod: any = await import(href);

            let render: unknown = mod?.render;
            if (typeof render !== 'function') {
                if (typeof mod?.default === 'function') {
                    render = mod.default;
                } else if (typeof mod?.default?.render === 'function') {
                    render = mod.default.render;
                }
            }

            if (typeof render !== 'function') {
                throw new Error(
                    "SSR Entry module does not export a 'render' function. Ensure the entry exports render()."
                );
            }

            const result = (await (render as (ctx: SsrContext) => any)({ ...context, ...options })) || {};

            return {
                html: result.html || '',
                head: result.head || '',
                state: result.state,
            };
        } catch (error: any) {
            return {
                html: '',
                head: '',
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }

    clearCache() {
        // ESM module records cannot be evicted from the loader cache; each dev
        // server process imports the entry once, which is sufficient for tests
        // and dev usage. Present for API compatibility.
    }
}
