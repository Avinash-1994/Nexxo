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
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'urja-governance': urjaGovernance,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            'urja-governance/no-internal-imports': 'error',
            'urja-governance/require-experimental-flag': 'warn',
            'urja-governance/no-graph-mutation': 'error',
            'urja-governance/no-cache-access': 'error',
        },
    },
    {
        // Allow internal core/resolve/plugins/presets files to import from each other
        files: [
            'src/core/**/*.ts',
            'src/resolve/**/*.ts',
            'src/visual/**/*.ts',
            'src/plugins/**/*.ts',
            'src/presets/**/*.ts'
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
        }
    }
];
