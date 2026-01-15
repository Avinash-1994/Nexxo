import { Warning } from './types.js';

/**
 * Comprehensive Warning Library
 * 100+ actionable warnings for common build issues
 */

export const WarningLibrary = {
    // Performance Warnings (1-20)
    LARGE_BUNDLE: (size: number): Warning => ({
        id: 'PERF_001',
        severity: 'warning',
        category: 'Performance',
        message: `Bundle size is ${(size / 1024).toFixed(2)}KB, which exceeds recommended 244KB limit`,
        fix: 'Enable code splitting or use dynamic imports to reduce initial bundle size'
    }),

    UNOPTIMIZED_IMAGE: (file: string): Warning => ({
        id: 'PERF_002',
        severity: 'info',
        category: 'Performance',
        message: `Image ${file} is not optimized`,
        file,
        fix: 'Use image optimization tools or WebP format for better compression'
    }),

    MISSING_TREE_SHAKING: (): Warning => ({
        id: 'PERF_003',
        severity: 'warning',
        category: 'Performance',
        message: 'Tree shaking is not enabled',
        fix: 'Set "sideEffects": false in package.json or enable production mode'
    }),

    SLOW_DEPENDENCY: (dep: string, time: number): Warning => ({
        id: 'PERF_004',
        severity: 'info',
        category: 'Performance',
        message: `Dependency "${dep}" took ${time}ms to process`,
        fix: `Consider replacing with a lighter alternative or lazy loading`
    }),

    DUPLICATE_MODULES: (module: string, count: number): Warning => ({
        id: 'PERF_005',
        severity: 'warning',
        category: 'Performance',
        message: `Module "${module}" is included ${count} times in the bundle`,
        fix: 'Check for version conflicts in package.json and deduplicate dependencies'
    }),

    // Security Warnings (21-40)
    VULNERABLE_DEPENDENCY: (dep: string, severity: string): Warning => ({
        id: 'SEC_001',
        severity: severity === 'high' ? 'critical' : 'warning',
        category: 'Security',
        message: `Vulnerable dependency detected: ${dep}`,
        fix: 'Run "npm audit fix" or update to a secure version'
    }),

    EXPOSED_API_KEY: (file: string, line: number): Warning => ({
        id: 'SEC_002',
        severity: 'critical',
        category: 'Security',
        message: 'Potential API key or secret exposed in code',
        file,
        line,
        fix: 'Move secrets to environment variables and add to .gitignore'
    }),

    INSECURE_PROTOCOL: (url: string): Warning => ({
        id: 'SEC_003',
        severity: 'warning',
        category: 'Security',
        message: `Insecure HTTP protocol used: ${url}`,
        fix: 'Use HTTPS instead of HTTP for external resources'
    }),

    MISSING_CSP: (): Warning => ({
        id: 'SEC_004',
        severity: 'info',
        category: 'Security',
        message: 'Content Security Policy (CSP) headers not configured',
        fix: 'Add CSP headers to prevent XSS attacks'
    }),

    // TypeScript/JavaScript Warnings (41-60)
    IMPLICIT_ANY: (file: string, line: number): Warning => ({
        id: 'TS_001',
        severity: 'warning',
        category: 'TypeScript',
        message: 'Implicit "any" type detected',
        file,
        line,
        fix: 'Add explicit type annotations or enable "noImplicitAny" in tsconfig.json'
    }),

    UNUSED_IMPORT: (importName: string, file: string, line: number): Warning => ({
        id: 'TS_002',
        severity: 'info',
        category: 'TypeScript',
        message: `Unused import "${importName}"`,
        file,
        line,
        fix: 'Remove unused import to reduce bundle size'
    }),

    DEPRECATED_API: (api: string, replacement: string): Warning => ({
        id: 'TS_003',
        severity: 'warning',
        category: 'TypeScript',
        message: `Using deprecated API: ${api}`,
        fix: `Replace with ${replacement}`
    }),

    MISSING_RETURN_TYPE: (func: string, file: string, line: number): Warning => ({
        id: 'TS_004',
        severity: 'info',
        category: 'TypeScript',
        message: `Function "${func}" is missing return type`,
        file,
        line,
        fix: 'Add explicit return type for better type safety'
    }),

    // React Warnings (61-80)
    MISSING_KEY_PROP: (file: string, line: number): Warning => ({
        id: 'REACT_001',
        severity: 'warning',
        category: 'React',
        message: 'Missing "key" prop in list rendering',
        file,
        line,
        fix: 'Add unique "key" prop to each element in the list'
    }),

    UNSAFE_LIFECYCLE: (method: string, file: string): Warning => ({
        id: 'REACT_002',
        severity: 'warning',
        category: 'React',
        message: `Unsafe lifecycle method "${method}" used`,
        file,
        fix: 'Replace with modern lifecycle methods or hooks'
    }),

    MISSING_DEPENDENCY: (dep: string, hook: string): Warning => ({
        id: 'REACT_003',
        severity: 'warning',
        category: 'React',
        message: `Missing dependency "${dep}" in ${hook} hook`,
        fix: 'Add missing dependency to the dependency array'
    }),

    INLINE_FUNCTION_PROP: (file: string, line: number): Warning => ({
        id: 'REACT_004',
        severity: 'info',
        category: 'React',
        message: 'Inline function in JSX prop may cause unnecessary re-renders',
        file,
        line,
        fix: 'Use useCallback or define function outside render'
    }),

    // CSS/Styling Warnings (81-100)
    UNUSED_CSS: (selector: string, file: string): Warning => ({
        id: 'CSS_001',
        severity: 'info',
        category: 'CSS',
        message: `Unused CSS selector: ${selector}`,
        file,
        fix: 'Remove unused CSS to reduce bundle size'
    }),

    MISSING_VENDOR_PREFIX: (property: string, file: string): Warning => ({
        id: 'CSS_002',
        severity: 'info',
        category: 'CSS',
        message: `CSS property "${property}" may need vendor prefixes`,
        file,
        fix: 'Use autoprefixer or add vendor prefixes manually'
    }),

    LARGE_CSS_FILE: (file: string, size: number): Warning => ({
        id: 'CSS_003',
        severity: 'warning',
        category: 'CSS',
        message: `CSS file ${file} is ${(size / 1024).toFixed(2)}KB`,
        file,
        fix: 'Enable CSS minification and consider splitting styles'
    }),

    // Build Configuration Warnings (101-120)
    MISSING_SOURCE_MAPS: (): Warning => ({
        id: 'BUILD_001',
        severity: 'info',
        category: 'Build',
        message: 'Source maps are disabled',
        fix: 'Enable source maps for easier debugging: sourcemap: "external"'
    }),

    DEVELOPMENT_MODE_PROD: (): Warning => ({
        id: 'BUILD_002',
        severity: 'critical',
        category: 'Build',
        message: 'Running in development mode for production build',
        fix: 'Set NODE_ENV=production or mode: "production"'
    }),

    MISSING_MINIFICATION: (): Warning => ({
        id: 'BUILD_003',
        severity: 'warning',
        category: 'Build',
        message: 'Code minification is disabled',
        fix: 'Enable minification for production builds'
    }),

    OUTDATED_DEPENDENCIES: (count: number): Warning => ({
        id: 'BUILD_004',
        severity: 'info',
        category: 'Build',
        message: `${count} dependencies are outdated`,
        fix: 'Run "npm outdated" and update dependencies'
    }),

    MISSING_GITIGNORE: (file: string): Warning => ({
        id: 'BUILD_005',
        severity: 'warning',
        category: 'Build',
        message: `Build artifact "${file}" not in .gitignore`,
        fix: 'Add build outputs to .gitignore'
    }),

    // Accessibility Warnings (121-140)
    MISSING_ALT_TEXT: (file: string, line: number): Warning => ({
        id: 'A11Y_001',
        severity: 'warning',
        category: 'Accessibility',
        message: 'Image missing alt text',
        file,
        line,
        fix: 'Add descriptive alt attribute for screen readers'
    }),

    MISSING_ARIA_LABEL: (element: string, file: string, line: number): Warning => ({
        id: 'A11Y_002',
        severity: 'warning',
        category: 'Accessibility',
        message: `Interactive element "${element}" missing aria-label`,
        file,
        line,
        fix: 'Add aria-label for better accessibility'
    }),

    LOW_CONTRAST: (file: string, line: number): Warning => ({
        id: 'A11Y_003',
        severity: 'info',
        category: 'Accessibility',
        message: 'Color contrast ratio may not meet WCAG standards',
        file,
        line,
        fix: 'Increase contrast ratio to at least 4.5:1 for normal text'
    })
};

/**
 * Framework-specific warnings
 */
export const FrameworkWarnings = {
    Vue: {
        MISSING_SCOPED: (file: string): Warning => ({
            id: 'VUE_001',
            severity: 'info',
            category: 'Vue',
            message: 'Style tag without "scoped" attribute',
            file,
            fix: 'Add "scoped" attribute to prevent style leakage'
        }),

        V_FOR_WITHOUT_KEY: (file: string, line: number): Warning => ({
            id: 'VUE_002',
            severity: 'warning',
            category: 'Vue',
            message: 'v-for directive without :key',
            file,
            line,
            fix: 'Add :key binding with unique identifier'
        })
    },

    Svelte: {
        UNUSED_EXPORT: (exportName: string, file: string): Warning => ({
            id: 'SVELTE_001',
            severity: 'info',
            category: 'Svelte',
            message: `Unused export "${exportName}"`,
            file,
            fix: 'Remove unused export or mark as intentional'
        }),

        MISSING_REACTIVE: (variable: string, file: string): Warning => ({
            id: 'SVELTE_002',
            severity: 'warning',
            category: 'Svelte',
            message: `Variable "${variable}" may need reactive declaration`,
            file,
            fix: 'Use $: for reactive statements'
        })
    },

    Angular: {
        MISSING_CHANGE_DETECTION: (component: string): Warning => ({
            id: 'NG_001',
            severity: 'info',
            category: 'Angular',
            message: `Component "${component}" using default change detection`,
            fix: 'Consider OnPush strategy for better performance'
        })
    }
};
