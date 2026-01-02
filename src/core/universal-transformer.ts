/**
 * Universal Framework Transformer
 * Version-agnostic transformer that works with any framework version
 * Automatically adapts to the installed version
 */

import path from 'path';
import fs from 'fs/promises';
import type { Framework } from '../core/framework-detector.js';
import { getFrameworkPreset } from '../presets/frameworks.js';
import { log } from '../utils/logger.js';
import { createRequire } from 'module';
import * as esbuild from 'esbuild';
import { canonicalHash } from '../core/engine/hash.js';
const _require = createRequire(import.meta.url);

export interface TransformOptions {
    filePath: string;
    code: string;
    framework: Framework;
    root: string;
    isDev?: boolean;
    define?: Record<string, string>;
    target?: 'browser' | 'node' | 'edge';
}

export interface TransformResult {
    code: string;
    map?: string;
    dependencies?: string[];
}

export class UniversalTransformer {
    private root: string;
    private transformers: Map<Framework, any> = new Map();
    private packageVersionCache: Map<string, string | null> = new Map();
    private transformCache: Map<string, TransformResult> = new Map();
    private cacheEnabled: boolean = true;

    constructor(root: string, options?: { cache?: boolean }) {
        this.root = root;
        this.cacheEnabled = options?.cache !== false;
    }

    /**
     * Clear transformation cache (useful for HMR)
     */
    clearCache(filePath?: string) {
        if (filePath) {
            this.transformCache.delete(filePath);
        } else {
            this.transformCache.clear();
        }
    }

    /**
     * Transform code based on framework
     * Automatically detects and uses the installed version
     */
    async transform(options: TransformOptions): Promise<TransformResult> {
        const { filePath, code, framework, isDev = true } = options;

        // Check cache first (only in dev mode for faster HMR)
        if (this.cacheEnabled && isDev) {
            const h = canonicalHash(code).substring(0, 16);
            const cacheKey = `${filePath}:${h}:${framework}`;
            const cached = this.transformCache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const preset = getFrameworkPreset(framework);

        // Route to appropriate transformer
        let result: TransformResult;
        switch (framework) {
            case 'react':
            case 'next':
            case 'remix':
                result = await this.transformReact(code, filePath, isDev);
                break;

            case 'vue':
            case 'nuxt':
                result = await this.transformVue(code, filePath, isDev);
                break;

            case 'svelte':
                result = await this.transformSvelte(code, filePath, isDev);
                break;

            case 'angular':
                result = await this.transformAngular(code, filePath, isDev);
                break;

            case 'solid':
                result = await this.transformSolid(code, filePath, isDev);
                break;

            case 'preact':
                result = await this.transformPreact(code, filePath, isDev);
                break;

            case 'qwik':
                result = await this.transformQwik(code, filePath, isDev);
                break;

            case 'lit':
                result = await this.transformLit(code, filePath, isDev);
                break;

            case 'astro':
                result = await this.transformAstro(code, filePath, isDev);
                break;
            case 'vanilla':
            default:
                result = await this.transformVanilla(code, filePath, isDev);
                break;
        }

        // Final Normalization Pass (Phase F1 Honest)
        // Ensure code matches the target platform requirements
        if (!options.filePath.endsWith('.css')) {
            try {
                const finalResult = await esbuild.transform(result.code, {
                    define: options.define || {},
                    loader: 'jsx',
                    format: options.target === 'node' ? 'cjs' : 'esm',
                    platform: options.target === 'node' ? 'node' : 'browser',
                    target: 'es2020'
                });
                result.code = finalResult.code;
            } catch (err: any) {
                // Log warning but don't fail
            }
        }

        // Cache the result
        if (this.cacheEnabled && isDev) {
            const h = canonicalHash(code).substring(0, 16);
            const cacheKey = `${filePath}:${h}:${framework}`;
            this.transformCache.set(cacheKey, result);
        }

        return result;
    }

    /**
     * React Transformer - Works with all React versions (16+)
     */
    private async transformReact(code: string, filePath: string, isDev: boolean, jsxOptions?: { importSource?: string }): Promise<TransformResult> {
        const ext = path.extname(filePath);

        // Only transform JSX/TSX files
        if (ext !== '.jsx' && ext !== '.tsx') {
            return this.transformVanilla(code, filePath, isDev);
        }

        try {
            const babel = await import('@babel/core');

            // Detect React version to use appropriate transform
            const reactVersion = await this.getPackageVersion('react');
            const useAutomatic = (reactVersion && parseInt(reactVersion) >= 17) || !!jsxOptions?.importSource;

            // Resolve presets from tool's dependencies, not user's project
            const output = await babel.transformAsync(code, {
                filename: filePath,
                presets: [
                    [
                        _require.resolve('@babel/preset-react'),
                        {
                            runtime: useAutomatic ? 'automatic' : 'classic',
                            development: isDev,
                            importSource: jsxOptions?.importSource // For Preact/others
                        }
                    ],
                    _require.resolve('@babel/preset-typescript')
                ],
                sourceMaps: isDev ? 'inline' : false
            });

            return {
                code: output?.code || code,
                map: output?.map ? JSON.stringify(output.map) : undefined
            };
        } catch (error: any) {
            log.error(`React transform failed for ${filePath}: ${error.stack}`);
            return this.transformVanilla(code, filePath, isDev);
        }
    }

    /**
     * Vue Transformer - Works with all Vue versions (2.x, 3.x)
     */
    private async transformVue(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        if (!filePath.endsWith('.vue')) {
            return this.transformVanilla(code, filePath, isDev);
        }

        try {
            let compiler: any;
            try {
                compiler = await import('@vue/compiler-sfc');
            } catch {
                try {
                    const compilerPath = _require.resolve('@vue/compiler-sfc', { paths: [this.root] });
                    compiler = await import(compilerPath);
                } catch {
                    try {
                        // @ts-ignore
                        compiler = await import('vue-template-compiler');
                    } catch {
                        try {
                            const compilerPath = _require.resolve('vue-template-compiler', { paths: [this.root] });
                            compiler = await import(compilerPath);
                        } catch {
                            log.warn('No Vue compiler found, treating as vanilla');
                            return this.transformVanilla(code, filePath, isDev);
                        }
                    }
                }
            }

            if (compiler.parse) {
                const { descriptor } = compiler.parse(code, { filename: filePath });
                let output = '';

                if (descriptor.script || descriptor.scriptSetup) {
                    const scriptResult = compiler.compileScript(descriptor, {
                        id: filePath,
                        inlineTemplate: false
                    });
                    output += scriptResult.content;
                }

                if (descriptor.template) {
                    const templateResult = compiler.compileTemplate({
                        source: descriptor.template.content,
                        filename: filePath,
                        id: filePath,
                        scoped: descriptor.styles.some((s: any) => s.scoped),
                        compilerOptions: { mode: 'module' }
                    });
                    output += '\n' + templateResult.code;
                }

                if (descriptor.styles.length > 0) {
                    for (const style of descriptor.styles) {
                        const styleResult = compiler.compileStyle({
                            source: style.content,
                            filename: filePath,
                            id: filePath,
                            scoped: style.scoped
                        });
                        output += `\nconst style = document.createElement('style');\nstyle.textContent = ${JSON.stringify(styleResult.code)};\ndocument.head.appendChild(style);`;
                    }
                }

                return { code: output };
            }

            return { code };
        } catch (error: any) {
            log.error(`Vue transform failed for ${filePath}:`, error.message);
            return { code };
        }
    }

    /**
     * Svelte Transformer - Works with all Svelte versions (3.x, 4.x, 5.x)
     */
    private async transformSvelte(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        if (!filePath.endsWith('.svelte')) {
            return this.transformVanilla(code, filePath, isDev);
        }

        try {
            let svelte: any;
            try {
                const compilerPath = _require.resolve('svelte/compiler', { paths: [this.root, process.cwd()] });
                const mod = await import(compilerPath);
                svelte = typeof mod.compile === 'function' ? mod : (mod.default || mod);
            } catch {
                const mod = await import('svelte/compiler');
                svelte = typeof mod.compile === 'function' ? mod : (mod.default || mod);
            }

            const version = await this.getPackageVersion('svelte');
            const isSvelte5 = version && version.startsWith('5');

            const result = svelte.compile(code, {
                filename: filePath,
                dev: isDev,
                css: 'injected' as any,
                generate: isSvelte5 ? 'client' : 'dom'
            } as any);

            return {
                code: result.js.code,
                map: result.js.map ? JSON.stringify(result.js.map) : undefined
            };
        } catch (error: any) {
            log.error(`Svelte transform failed for ${filePath}: ${error.stack || error.message}`);
            return { code };
        }
    }

    /**
     * Angular Transformer - Works with ALL Angular versions (2-17+)
     */
    private async transformAngular(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        try {
            const ngVersion = await this.getPackageVersion('@angular/core');
            const majorVersion = ngVersion ? parseInt(ngVersion.split('.')[0]) : 17;

            if (filePath.endsWith('.ts')) {
                const ts = await import('typescript');
                try {
                    const compilerOptions: any = {
                        target: ts.ScriptTarget.ES2020,
                        module: ts.ModuleKind.ESNext,
                        experimentalDecorators: true,
                        emitDecoratorMetadata: true,
                        useDefineForClassFields: majorVersion >= 14 ? false : true,
                    };

                    const result = ts.transpileModule(code, {
                        compilerOptions,
                        fileName: filePath
                    });

                    return { code: result.outputText, map: result.sourceMapText };
                } catch {
                    return this.transformVanilla(code, filePath, isDev);
                }
            }

            if (filePath.endsWith('.html')) {
                return { code: `export default ${JSON.stringify(code)};` };
            }

            return this.transformVanilla(code, filePath, isDev);
        } catch (error: any) {
            log.error(`Angular transform failed for ${filePath}:`, error.message);
            return this.transformVanilla(code, filePath, isDev);
        }
    }

    /**
     * Solid Transformer - Works with all Solid versions
     */
    private async transformSolid(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        const ext = path.extname(filePath);
        if (ext !== '.jsx' && ext !== '.tsx') {
            return this.transformVanilla(code, filePath, isDev);
        }

        try {
            const babel = await import('@babel/core');
            const result = await babel.transformAsync(code, {
                filename: filePath,
                presets: [
                    _require.resolve('babel-preset-solid', { paths: [this.root] }),
                    _require.resolve('@babel/preset-typescript', { paths: [this.root] })
                ],
                sourceMaps: isDev ? 'inline' : false
            });

            return { code: result?.code || code, map: result?.map ? JSON.stringify(result.map) : undefined };
        } catch (error: any) {
            log.error(`Solid transform failed for ${filePath}:`, error.message);
            return this.transformVanilla(code, filePath, isDev);
        }
    }

    /**
     * Preact Transformer - Works with all Preact versions
     */
    private async transformPreact(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        return this.transformReact(code, filePath, isDev, { importSource: 'preact' });
    }

    /**
     * Qwik Transformer - Works with all Qwik versions
     */
    private async transformQwik(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        try {
            let qwik: any;
            try {
                const compilerPath = _require.resolve('@builder.io/qwik/optimizer', { paths: [this.root, process.cwd()] });
                const mod = await import(compilerPath);
                qwik = typeof mod.createOptimizer === 'function' ? mod : (mod.default || mod);
            } catch {
                // @ts-ignore
                const mod = await import('@builder.io/qwik/optimizer');
                qwik = typeof mod.createOptimizer === 'function' ? mod : (mod.default || mod);
            }

            const optimizer = await qwik.createOptimizer();
            const result = await optimizer.transformModules({
                input: [{ code, path: filePath }],
                srcDir: path.join(this.root, 'src'),
                entryStrategy: { type: 'single' },
                minify: isDev ? 'none' : 'simplify',
                sourceMaps: isDev,
                transpile: true,
            });

            const output = result.modules[0];
            const { transform } = await import('esbuild');
            const final = await transform(output.code, {
                loader: 'tsx',
                format: 'esm',
                target: 'es2022',
                jsx: 'automatic',
                jsxImportSource: '@builder.io/qwik'
            });

            return { code: final.code, map: final.map ? JSON.stringify(final.map) : undefined };
        } catch (error: any) {
            log.error(`Qwik transform failed for ${filePath}: ${error.stack || error.message}`);
            return this.transformVanilla(code, filePath, isDev);
        }
    }

    /**
     * Lit Transformer - Works with all Lit versions
     */
    private async transformLit(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        try {
            const ts = await import('typescript');
            const result = ts.transpileModule(code, {
                compilerOptions: {
                    target: ts.ScriptTarget.ES2020,
                    module: ts.ModuleKind.ESNext,
                    experimentalDecorators: true,
                    useDefineForClassFields: false,
                    moduleResolution: ts.ModuleResolutionKind.NodeJs
                },
                fileName: filePath
            });

            return { code: result.outputText, map: result.sourceMapText };
        } catch (error: any) {
            log.error(`Lit transform failed for ${filePath}:`, error.message);
            return this.transformVanilla(code, filePath, isDev);
        }
    }

    /**
     * Astro Transformer - Works with all Astro versions
     */
    private async transformAstro(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        if (!filePath.endsWith('.astro')) {
            return this.transformVanilla(code, filePath, isDev);
        }

        try {
            let astro: any;
            try {
                const compilerPath = _require.resolve('@astrojs/compiler', { paths: [this.root, process.cwd()] });
                const mod = await import(compilerPath);
                astro = typeof mod.transform === 'function' ? mod : (mod.default || mod);
            } catch {
                // @ts-ignore
                const mod = await import('@astrojs/compiler');
                astro = typeof mod.transform === 'function' ? mod : (mod.default || mod);
            }

            const result = await astro.transform(code, {
                filename: filePath,
                sourcemap: isDev ? 'inline' : false,
            });

            return { code: result.code, map: result.map ? JSON.stringify(result.map) : undefined };
        } catch (error: any) {
            log.error(`Astro transform failed for ${filePath}: ${error.stack || error.message}`);
            return { code };
        }
    }

    /**
     * Vanilla JS/TS Transformer - Works with all versions
     */
    private async transformVanilla(code: string, filePath: string, isDev: boolean): Promise<TransformResult> {
        const ext = path.extname(filePath);
        if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx' || ext === '.mjs') {
            try {
                const result = await esbuild.transform(code, {
                    loader: (ext === '.mjs' ? 'js' : ext.slice(1)) as any,
                    sourcemap: isDev ? 'inline' : false,
                    format: 'esm',
                    target: 'es2020',
                    tsconfigRaw: { compilerOptions: { experimentalDecorators: true } }
                });
                return { code: result.code, map: result.map };
            } catch (error: any) {
                log.error(`Vanilla transform failed for ${filePath}:`, error.message);
                return { code };
            }
        }
        return { code };
    }

    private async getPackageVersion(packageName: string): Promise<string | null> {
        if (this.packageVersionCache.has(packageName)) {
            return this.packageVersionCache.get(packageName)!;
        }

        try {
            const pkgPath = path.join(this.root, 'node_modules', packageName, 'package.json');
            const content = await fs.readFile(pkgPath, 'utf-8');
            const pkg = JSON.parse(content);
            const version = pkg.version;
            this.packageVersionCache.set(packageName, version);
            return version;
        } catch {
            this.packageVersionCache.set(packageName, null);
            return null;
        }
    }
}
