export default {
    preset: 'ts-jest/presets/default-esm', // Use ESM preset
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts', '.mts'],
    roots: ['<rootDir>/src'], // Only run tests in src
    transform: {
        '^.+\\.m?[tj]sx?$': ['ts-jest', {
            useESM: true,
            isolatedModules: true,
            tsconfig: {
                module: 'esnext',
                target: 'es2020',
                esModuleInterop: true
            }
        }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
