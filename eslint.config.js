import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import nexxoGovernance from 'eslint-plugin-nexxo-governance';
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                Buffer: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                // Browser globals for runtime/visual
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                location: 'readonly',
                history: 'readonly',
                HTMLElement: 'readonly',
                customElements: 'readonly',
                ShadowRoot: 'readonly',
                WebSocket: 'readonly',
                fetch: 'readonly',
                URL: 'readonly',
                RequestInfo: 'readonly',
                RequestInit: 'readonly',
                Response: 'readonly',
                globalThis: 'readonly',
                global: 'readonly',
                NodeRequire: 'readonly',
                URLSearchParams: 'readonly',
                ReadableStream: 'readonly',
                NodeJS: 'readonly',
                TextDecoder: 'readonly',
                TextEncoder: 'readonly',
                WebAssembly: 'readonly',
                performance: 'readonly',
                PerformanceNavigationTiming: 'readonly',
                HTMLInputElement: 'readonly',
                // Missing Globals
                Bun: 'readonly',
                Request: 'readonly',
                CryptoKey: 'readonly',
                CryptoKeyPair: 'readonly',
                ErrorEvent: 'readonly',
                PromiseRejectionEvent: 'readonly',
                requestAnimationFrame: 'readonly',
                // Jest globals
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly',
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'nexxo-governance': nexxoGovernance,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-empty': 'off',
            'no-useless-escape': 'off',
            'no-case-declarations': 'off',
            'nexxo-governance/no-internal-imports': 'error',
            'nexxo-governance/require-experimental-flag': 'warn',
            'nexxo-governance/no-graph-mutation': 'error',
            'nexxo-governance/no-cache-access': 'error',
        },
    },
    {
        // Allow internal core/resolve/plugins/presets/dev/build/ai/cli/builder/ui/audit/repro/fix files to import from each other
        files: [
            'src/core/**/*.ts',
            'src/resolve/**/*.ts',
            'src/visual/**/*.ts',
            'src/plugins/**/*.ts',
            'src/presets/**/*.ts',
            'src/dev/**/*.ts',
            'src/build/**/*.ts',
            'src/ai/**/*.ts',
            'src/cli/**/*.ts',
            'src/builder/**/*.ts',
            'src/ui/**/*.ts',
            'src/ui/**/*.tsx',
            'src/audit/**/*.ts',
            'src/repro/**/*.ts',
            'src/fix/**/*.ts'
        ],
        rules: {
            'nexxo-governance/no-internal-imports': 'off',
            'nexxo-governance/no-graph-mutation': 'off',
            'nexxo-governance/no-cache-access': 'off',
        }
    },
    {
        // Allow tests to be more permissive during stabilization
        files: ['tests/**/*.ts', 'examples/**/*.ts'],
        rules: {
            'nexxo-governance/no-internal-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off'
        }
    }
];
