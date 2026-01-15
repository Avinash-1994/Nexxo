import { describe, it, expect } from '../src/test/api.js';
import * as nativeIndex from '../src/native/index.js';

describe('Native Index Exports', () => {
    it('should export all required native functions', () => {
        expect(nativeIndex.GraphAnalyzer).toBeTruthy();
        expect(nativeIndex.BuildOrchestrator).toBeTruthy();
        expect(nativeIndex.fastHash).toBeTruthy();
        expect(nativeIndex.scanImports).toBeTruthy();
    });

    it('should export legacy alias', () => {
        expect(nativeIndex.RustNativeWorker).toBeTruthy();
    });

    it('should be able to hash strings via native binding', () => {
        // This actually tests the binary integration
        if (typeof nativeIndex.fastHash === 'function') {
            const hash = nativeIndex.fastHash('hello');
            expect(typeof hash).toBe('string');
            expect(hash.length).toBeGreaterThan(0);
        }
    });
});
