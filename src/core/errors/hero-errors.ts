/**
 * Hero Errors System
 * 
 * Provides rich, contextual error messages with:
 * - File chain visualization
 * - Graph explanation
 * - Suggested fixes
 * - Related documentation
 * 
 * Never show "Build failed" without context.
 */

import kleur from 'kleur';
import path from 'path';

export interface ErrorContext {
    code: string;
    message: string;
    file?: string;
    line?: number;
    column?: number;
    stack?: string;
    fileChain?: string[];
    graphExplanation?: string;
    suggestedFix?: string;
    relatedDocs?: string[];
    severity: 'error' | 'warning' | 'info';
}

export class HeroError extends Error {
    public readonly context: ErrorContext;

    constructor(context: ErrorContext) {
        super(context.message);
        this.name = 'HeroError';
        this.context = context;
    }

    /**
     * Format error for display with rich context
     */
    format(): string {
        const lines: string[] = [];
        const { context } = this;

        // Header
        lines.push('');
        lines.push(kleur.bold().red('═'.repeat(80)));
        lines.push(kleur.bold().red(`  ⚠️  ${context.code}: ${context.message}`));
        lines.push(kleur.bold().red('═'.repeat(80)));
        lines.push('');

        // File location
        if (context.file) {
            const location = context.line && context.column
                ? `${context.file}:${context.line}:${context.column}`
                : context.file;
            lines.push(kleur.cyan(`📁 Location: ${location}`));
            lines.push('');
        }

        // File chain (dependency path)
        if (context.fileChain && context.fileChain.length > 0) {
            lines.push(kleur.yellow('📊 Import Chain:'));
            context.fileChain.forEach((file, index) => {
                const isLast = index === context.fileChain!.length - 1;
                const prefix = isLast ? '  └─' : '  ├─';
                const arrow = index > 0 ? '→ ' : '';
                lines.push(kleur.dim(`${prefix} ${arrow}${file}`));
            });
            lines.push('');
        }

        // Graph explanation
        if (context.graphExplanation) {
            lines.push(kleur.magenta('🔍 Graph Analysis:'));
            lines.push(kleur.dim(`  ${context.graphExplanation}`));
            lines.push('');
        }

        // Suggested fix
        if (context.suggestedFix) {
            lines.push(kleur.green('💡 Suggested Fix:'));
            context.suggestedFix.split('\n').forEach(line => {
                lines.push(kleur.dim(`  ${line}`));
            });
            lines.push('');
        }

        // Related documentation
        if (context.relatedDocs && context.relatedDocs.length > 0) {
            lines.push(kleur.blue('📚 Related Documentation:'));
            context.relatedDocs.forEach(doc => {
                lines.push(kleur.dim(`  • ${doc}`));
            });
            lines.push('');
        }

        // Footer
        lines.push(kleur.bold().red('─'.repeat(80)));
        lines.push('');

        return lines.join('\n');
    }

    /**
     * Display error to console
     */
    display(): void {
        console.error(this.format());
    }
}

/**
 * Error Registry - 10 High-Impact Errors
 */

// 1. Module Not Found
export function createModuleNotFoundError(
    modulePath: string,
    importedFrom: string,
    fileChain: string[]
): HeroError {
    return new HeroError({
        code: 'MODULE_NOT_FOUND',
        message: `Cannot resolve module '${modulePath}'`,
        file: importedFrom,
        fileChain,
        graphExplanation: `The module '${modulePath}' was imported but could not be found in the dependency graph. This breaks the module resolution chain.`,
        suggestedFix: `1. Check if the file exists at: ${modulePath}\n2. Verify the import path is correct\n3. If it's an npm package, run: npm install ${modulePath}\n4. Check your urja.config resolve.alias settings`,
        relatedDocs: [
            'https://urja.dev/docs/module-resolution',
            'https://urja.dev/docs/troubleshooting#module-not-found'
        ],
        severity: 'error'
    });
}

// 2. Circular Dependency Detected
export function createCircularDependencyError(
    cycle: string[]
): HeroError {
    return new HeroError({
        code: 'CIRCULAR_DEPENDENCY',
        message: 'Circular dependency detected in module graph',
        fileChain: cycle,
        graphExplanation: `A circular dependency creates an infinite loop in the module graph. This can cause runtime errors and unpredictable behavior.`,
        suggestedFix: `1. Refactor to break the circular dependency\n2. Extract shared code into a separate module\n3. Use dependency injection or lazy loading\n4. Consider using dynamic imports: import('./module')`,
        relatedDocs: [
            'https://urja.dev/docs/circular-dependencies',
            'https://urja.dev/docs/best-practices#module-design'
        ],
        severity: 'error'
    });
}

// 3. CSS Import Failed
export function createCSSImportError(
    cssFile: string,
    reason: string,
    importedFrom?: string
): HeroError {
    return new HeroError({
        code: 'CSS_IMPORT_FAILED',
        message: `Failed to process CSS file: ${cssFile}`,
        file: cssFile,
        fileChain: importedFrom ? [importedFrom, cssFile] : [cssFile],
        graphExplanation: `CSS files are first-class nodes in Urja's dependency graph. This CSS file could not be processed, breaking the graph.`,
        suggestedFix: `1. Check CSS syntax: ${reason}\n2. Verify PostCSS config if using preprocessors\n3. Check for missing @import files\n4. Run: urja verify --explain to diagnose`,
        relatedDocs: [
            'https://urja.dev/docs/css-handling',
            'https://urja.dev/docs/postcss-integration'
        ],
        severity: 'error'
    });
}

// 4. Framework Adapter Missing
export function createFrameworkAdapterMissingError(
    framework: string
): HeroError {
    return new HeroError({
        code: 'FRAMEWORK_ADAPTER_MISSING',
        message: `Framework adapter not found: ${framework}`,
        graphExplanation: `Urja requires a framework adapter to transform framework-specific code. The adapter for '${framework}' is not installed.`,
        suggestedFix: `1. Install the adapter: npm install @urja/framework-${framework.toLowerCase()}\n2. Add to urja.config:\n   import ${framework.toLowerCase()} from '@urja/framework-${framework.toLowerCase()}';\n   export default { framework: ${framework.toLowerCase()}() }`,
        relatedDocs: [
            'https://urja.dev/docs/framework-adapters',
            `https://urja.dev/docs/frameworks/${framework.toLowerCase()}`
        ],
        severity: 'error'
    });
}

// 5. Invalid Config
export function createInvalidConfigError(
    configPath: string,
    validationErrors: string[]
): HeroError {
    return new HeroError({
        code: 'INVALID_CONFIG',
        message: 'Configuration file is invalid',
        file: configPath,
        graphExplanation: `The urja.config file failed validation. This prevents the build from starting.`,
        suggestedFix: `Fix the following validation errors:\n${validationErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\nRun: urja verify --explain for detailed diagnostics`,
        relatedDocs: [
            'https://urja.dev/docs/configuration',
            'https://urja.dev/docs/config-schema'
        ],
        severity: 'error'
    });
}

// 6. Build Cache Corrupted
export function createCacheCorruptedError(
    cachePath: string
): HeroError {
    return new HeroError({
        code: 'CACHE_CORRUPTED',
        message: 'Build cache is corrupted',
        file: cachePath,
        graphExplanation: `The SQLite build cache has become corrupted. This can happen due to interrupted builds or disk errors.`,
        suggestedFix: `1. Delete the cache: rm -rf ${cachePath}\n2. Rebuild: urja build\n3. If issue persists, check disk health\n4. Consider disabling cache temporarily: urja build --no-cache`,
        relatedDocs: [
            'https://urja.dev/docs/caching',
            'https://urja.dev/docs/troubleshooting#cache-issues'
        ],
        severity: 'warning'
    });
}

// 7. HMR Connection Failed
export function createHMRConnectionError(
    port: number,
    reason: string
): HeroError {
    return new HeroError({
        code: 'HMR_CONNECTION_FAILED',
        message: `Hot Module Replacement connection failed on port ${port}`,
        graphExplanation: `The HMR WebSocket connection could not be established. This prevents live updates during development.`,
        suggestedFix: `1. Check if port ${port} is available\n2. Verify firewall settings\n3. Try a different port: urja dev --port ${port + 1}\n4. Check browser console for WebSocket errors\n\nReason: ${reason}`,
        relatedDocs: [
            'https://urja.dev/docs/hmr',
            'https://urja.dev/docs/dev-server#troubleshooting'
        ],
        severity: 'warning'
    });
}

// 8. Asset Resolution Failed
export function createAssetResolutionError(
    assetPath: string,
    importedFrom: string
): HeroError {
    return new HeroError({
        code: 'ASSET_RESOLUTION_FAILED',
        message: `Cannot resolve asset: ${assetPath}`,
        file: importedFrom,
        fileChain: [importedFrom, assetPath],
        graphExplanation: `Assets (images, fonts, etc.) are tracked in the dependency graph. This asset could not be found.`,
        suggestedFix: `1. Check if file exists: ${assetPath}\n2. Verify the path is correct\n3. Check public directory configuration\n4. Ensure file extension is supported`,
        relatedDocs: [
            'https://urja.dev/docs/assets',
            'https://urja.dev/docs/static-assets'
        ],
        severity: 'error'
    });
}

// 9. TypeScript Compilation Error
export function createTypeScriptError(
    file: string,
    line: number,
    column: number,
    message: string,
    code: string
): HeroError {
    return new HeroError({
        code: 'TYPESCRIPT_ERROR',
        message: `TypeScript compilation failed: ${message}`,
        file,
        line,
        column,
        graphExplanation: `TypeScript type checking failed. While Urja uses esbuild for fast transpilation, type errors indicate potential runtime issues.`,
        suggestedFix: `1. Fix the type error at ${file}:${line}:${column}\n2. Run: npx tsc --noEmit for full type checking\n3. Check tsconfig.json settings\n4. Error code: ${code}`,
        relatedDocs: [
            'https://urja.dev/docs/typescript',
            `https://www.typescriptlang.org/docs/handbook/error.html#${code}`
        ],
        severity: 'error'
    });
}

// 10. Plugin Hook Error
export function createPluginHookError(
    pluginName: string,
    hookName: string,
    error: Error
): HeroError {
    return new HeroError({
        code: 'PLUGIN_HOOK_ERROR',
        message: `Plugin '${pluginName}' failed in '${hookName}' hook`,
        graphExplanation: `A plugin hook threw an error during the build process. This indicates a bug in the plugin or incompatibility.`,
        suggestedFix: `1. Check plugin version compatibility\n2. Review plugin configuration\n3. Try disabling the plugin temporarily\n4. Report issue to plugin author\n\nOriginal error: ${error.message}`,
        relatedDocs: [
            'https://urja.dev/docs/plugins',
            'https://urja.dev/docs/plugin-api'
        ],
        severity: 'error',
        stack: error.stack
    });
}

/**
 * Wrap any error in a HeroError with context
 */
export function wrapError(error: Error, context?: Partial<ErrorContext>): HeroError {
    if (error instanceof HeroError) {
        return error;
    }

    return new HeroError({
        code: 'UNKNOWN_ERROR',
        message: error.message,
        stack: error.stack,
        severity: 'error',
        suggestedFix: 'This is an unexpected error. Please report it to: https://github.com/Avinash-1994/urja/issues',
        relatedDocs: ['https://urja.dev/docs/troubleshooting'],
        ...context
    });
}

/**
 * Print a Hero Error to the console
 */
export function printHeroError(error: HeroError): void {
    error.display();
}
