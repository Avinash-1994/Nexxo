import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import urjaGovernance from 'eslint-plugin-urja-governance';
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
            'urja-governance': urjaGovernance,
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
            'urja-governance/no-internal-imports': 'error',
            'urja-governance/require-experimental-flag': 'warn',
            'urja-governance/no-graph-mutation': 'error',
            'urja-governance/no-cache-access': 'error',
        },
    },
    {
        // Allow internal core/resolve/plugins/presets/dev/build/ai/cli/builder files to import from each other
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
            'src/builder/**/*.ts'
        ],
        rules: {
            'urja-governance/no-internal-imports': 'off',
            'urja-governance/no-graph-mutation': 'off',
            'urja-governance/no-cache-access': 'off',
        }
    },
    {
        // Allow tests to be more permissive during stabilization
        files: ['tests/**/*.ts', 'examples/**/*.ts'],
        rules: {
            'urja-governance/no-internal-imports': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off'
        }
    }
];
