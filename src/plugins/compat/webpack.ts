import { Plugin } from '../index.js';
import path from 'path';
import fs from 'fs/promises';

// Basic Webpack Loader Context Interface
// subset of https://webpack.js.org/api/loaders/#the-loader-context
export interface WebpackLoaderContext {
    resourcePath: string;
    rootContext: string;
    context: string;
    async: () => (err: Error | null, content?: string | Buffer, map?: any, meta?: any) => void;
    callback: (err: Error | null, content?: string | Buffer, map?: any, meta?: any) => void;
    cacheable: (flag?: boolean) => void;
    emitFile: (name: string, content: string | Buffer, sourceMap?: any) => void;
    addDependency: (file: string) => void;
    fs: any;
    query: any;
    [key: string]: any;
}

export type WebpackLoader = (this: WebpackLoaderContext, content: string | Buffer, map?: any, meta?: any) => void | undefined | string | Buffer | Promise<string | Buffer | void | undefined>;

export interface WebpackAdapterOptions {
    name?: string;
    test: RegExp;
    loader: WebpackLoader;
    options?: any;
}

/**
 * Adapter to use Webpack Loaders within Nexxo
 * Maps Webpack's loader API to Nexxo's transform hook.
 */
export function webpackLoaderAdapter(opts: WebpackAdapterOptions): Plugin {
    const name = opts.name || 'webpack-loader-compat';

    return {
        name: name,

        async transform(code: string, id: string) {
            // Only apply if ID matches test
            if (!opts.test.test(id)) return undefined;

            return new Promise((resolve, reject) => {
                let isAsync = false;
                let isDone = false;

                const context: Partial<WebpackLoaderContext> = {
                    resourcePath: id,
                    rootContext: process.cwd(),
                    context: path.dirname(id),
                    query: opts.options || {},
                    fs: fs,

                    // Cacheable is a no-op in Nexxo (we handle caching at graph level)
                    cacheable: () => { },

                    // Dependency tracking
                    addDependency: (file: string) => {
                        // TODO: Hook into Nexxo's graph dependency tracking
                        // context.meta.watchFiles.add(file);
                    },

                    emitFile: (name: string, content: string | Buffer) => {
                        // TODO: Hook into Nexxo's asset emission
                    },

                    async: () => {
                        isAsync = true;
                        return (err, result, map) => {
                            if (isDone) return;
                            isDone = true;
                            if (err) reject(err);
                            else resolve(result ? (typeof result === 'string' ? result : result.toString()) : undefined);
                        };
                    },

                    callback: (err, result, map) => {
                        if (isDone) return;
                        isDone = true;
                        if (err) reject(err);
                        else resolve(result ? (typeof result === 'string' ? result : result.toString()) : undefined);
                    }
                };

                // Execute Loader
                try {
                    const result = opts.loader.call(context as WebpackLoaderContext, code, undefined);

                    if (!isAsync && !isDone) {
                        isDone = true;
                        if (result !== undefined) {
                            resolve(typeof result === 'string' ? result : result ? result.toString() : code);
                        } else {
                            // If loader validates but returns undefined (and didn't call async), 
                            // it means no change or side-effect. We return undefined to let other plugins handle it or keep as is.
                            resolve(code);
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }
    };
}
