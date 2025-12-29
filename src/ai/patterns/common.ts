import { FixAction } from '../healer/fixer.js';

export interface ErrorPattern {
    id: string;
    name: string;
    regex: RegExp;
    generator: (match: RegExpMatchArray) => FixAction;
}

export const CommonPatterns: ErrorPattern[] = [
    {
        id: 'missing-dep',
        name: 'Missing Dependency',
        regex: /Cannot find module '(@?[\w-]+(?:\/[\w-]+)*)'|Can't resolve '(@?[\w-]+(?:\/[\w-]+)*)'/i,
        generator: (match) => {
            const pkg = match[1] || match[2];
            return {
                type: 'SHELL_COMMAND',
                description: `Install missing dependency: ${pkg}`,
                command: `npm install ${pkg}`,
                confidence: 0.95
            };
        }
    },
    {
        id: 'react-peer-dep',
        name: 'React Peer Dependency Mismatch',
        regex: /conflicting peer dependency|peer dependency .* detected/i,
        generator: () => ({
            type: 'SHELL_COMMAND',
            description: 'Install with legacy peer deps',
            command: 'npm install --legacy-peer-deps',
            confidence: 0.8
        })
    },
    {
        id: 'tailwind-purge',
        name: 'Tailwind Purge Warning',
        regex: /Tailwind CSS: .*purge.* content/i,
        generator: () => ({
            type: 'MANUAL_INSTRUCTION',
            description: 'Configure Tailwind purge content paths',
            confidence: 0.9
        })
    },
    {
        id: 'ts-config-error',
        name: 'TypeScript Config Error',
        regex: /error TS\d+: .*tsconfig\.json/i,
        generator: () => ({
            type: 'MANUAL_INSTRUCTION',
            description: 'Check tsconfig.json configuration',
            confidence: 0.7
        })
    },
    {
        id: 'missing-types',
        name: 'Missing Type Definitions',
        regex: /Could not find a declaration file for module '(@?[\w-]+(?:\/[\w-]+)*)'/i,
        generator: (match) => {
            const pkg = match[1];
            return {
                type: 'SHELL_COMMAND',
                description: `Install type definitions for ${pkg}`,
                command: `npm install -D @types/${pkg.replace('@', '').replace('/', '__')}`,
                confidence: 0.85
            };
        }
    },
    {
        id: 'port-in-use',
        name: 'Port Already in Use',
        regex: /EADDRINUSE.*:(\d+)|Port (\d+) is already in use/i,
        generator: (match) => {
            const port = match[1] || match[2];
            return {
                type: 'MANUAL_INSTRUCTION',
                description: `Port ${port} is in use. Kill the process or use a different port.`,
                confidence: 0.9
            };
        }
    },
    {
        id: 'node-version',
        name: 'Node Version Mismatch',
        regex: /The engine "node" is incompatible|requires node version/i,
        generator: () => ({
            type: 'MANUAL_INSTRUCTION',
            description: 'Update Node.js version or use nvm to switch versions',
            confidence: 0.8
        })
    },
    {
        id: 'eslint-error',
        name: 'ESLint Error',
        regex: /ESLint.*error|Parsing error.*eslint/i,
        generator: () => ({
            type: 'SHELL_COMMAND',
            description: 'Run ESLint fix',
            command: 'npm run lint -- --fix',
            confidence: 0.7
        })
    },
    {
        id: 'cors-error',
        name: 'CORS Error',
        regex: /CORS|Cross-Origin Request Blocked/i,
        generator: () => ({
            type: 'MANUAL_INSTRUCTION',
            description: 'Configure CORS headers in your server or use a proxy',
            confidence: 0.75
        })
    },
    {
        id: 'memory-limit',
        name: 'JavaScript Heap Out of Memory',
        regex: /JavaScript heap out of memory|FATAL ERROR.*heap/i,
        generator: () => ({
            type: 'SHELL_COMMAND',
            description: 'Increase Node.js memory limit',
            command: 'export NODE_OPTIONS="--max-old-space-size=4096"',
            confidence: 0.85
        })
    },
    {
        id: 'git-conflict',
        name: 'Git Merge Conflict',
        regex: /CONFLICT.*Merge conflict|<<<<<<< HEAD/i,
        generator: () => ({
            type: 'MANUAL_INSTRUCTION',
            description: 'Resolve merge conflicts manually',
            confidence: 0.6
        })
    },
    {
        id: 'permission-denied',
        name: 'Permission Denied',
        regex: /EACCES|Permission denied/i,
        generator: () => ({
            type: 'MANUAL_INSTRUCTION',
            description: 'Run with sudo or fix file permissions',
            confidence: 0.7
        })
    },
    {
        id: 'webpack-loader',
        name: 'Missing Webpack Loader',
        regex: /You may need an appropriate loader|Module parse failed/i,
        generator: () => ({
            type: 'MANUAL_INSTRUCTION',
            description: 'Install appropriate webpack loader for this file type',
            confidence: 0.75
        })
    },
    {
        id: 'react-hooks',
        name: 'Invalid React Hook Call',
        regex: /Invalid hook call|Hooks can only be called inside/i,
        generator: () => ({
            type: 'MANUAL_INSTRUCTION',
            description: 'Check for multiple React versions or hook usage outside components',
            confidence: 0.8
        })
    },
    {
        id: 'env-variable',
        name: 'Missing Environment Variable',
        regex: /process\.env\.(\w+) is not defined|Missing environment variable/i,
        generator: (match) => {
            const varName = match[1] || 'VARIABLE';
            return {
                type: 'MANUAL_INSTRUCTION',
                description: `Set environment variable ${varName} in .env file`,
                confidence: 0.85
            };
        }
    },
    {
        id: 'urja-config-error',
        name: 'Urja Config Validation Error',
        regex: /Invalid config file/i,
        generator: () => {
            return {
                type: 'MANUAL_INSTRUCTION',
                description: 'Fix urja.config configuration - check for type mismatches or missing fields.',
                confidence: 0.95
            };
        }
    }
];
