import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import path from 'path';

// MUST be before imports
(jest as any).unstable_mockModule('fs/promises', () => ({
    __esModule: true,
    default: {
        mkdir: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn(),
        access: jest.fn(),
    }
}));

(jest as any).unstable_mockModule('esbuild', () => ({
    __esModule: true,
    build: jest.fn()
}));

(jest as any).unstable_mockModule('../../utils/logger.js', () => ({
    __esModule: true,
    log: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    }
}));

// Dynamic imports will be used in tests
const fs = await import('fs/promises');
const { build } = await import('esbuild');
const { DependencyPreBundler } = await import('../preBundler.js');

describe('DependencyPreBundler', () => {
    let preBundler: InstanceType<typeof DependencyPreBundler>;
    const mockRoot = '/mock/root';

    beforeEach(() => {
        jest.clearAllMocks();
        preBundler = new DependencyPreBundler(mockRoot);

        // Default fs mocks
        (fs.default.mkdir as unknown as jest.Mock<() => Promise<void>>).mockResolvedValue(undefined);
        (fs.default.readFile as unknown as jest.Mock<() => Promise<string>>).mockResolvedValue('{}');
        (build as unknown as jest.Mock<() => Promise<any>>).mockResolvedValue({ metafile: { outputs: {} } });
    });

    it('should calculate package hash from package.json', async () => {
        (fs.default.readFile as unknown as jest.Mock<() => Promise<string>>).mockImplementation(((p: string) => {
            if (p.includes('package.json')) {
                return Promise.resolve(JSON.stringify({ dependencies: { 'react': '1.0.0' } }));
            }
            return Promise.resolve('{}');
        }) as any);

        await preBundler.preBundleDependencies(['react']);

        expect(fs.default.readFile).toHaveBeenCalledWith(path.join(mockRoot, 'package.json'), 'utf-8');
    });
});
