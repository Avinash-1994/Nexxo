export default {
    preset: 'ts-jest/presets/default-esm', // Use ESM preset
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    testMatch: [
        '<rootDir>/tests/**/*.test.ts',
        '<rootDir>/src/**/*.test.ts'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/tests/e2e/',
        '/tests/module7_'
    ],
    roots: ['<rootDir>/tests', '<rootDir>/src'], // Run tests in both directories
    transform: {
        '^.+\\.m?[tj]sx?$': ['ts-jest', {
            useESM: true,
            isolatedModules: true,
            tsconfig: {
                module: 'esnext',
                target: 'es2020',
                esModuleInterop: true,
                moduleResolution: 'bundler'
            }
        }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/cli/**',
    ],
};
