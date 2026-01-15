// tests/runner_verification_test.ts
// This file tests the custom @nexxo/test runner itself

describe('Nexxo Test Runner', () => {
    it('should support describe/it blocks', () => {
        expect(true).toBe(true);
    });

    it('should support expect matchers', () => {
        expect(1).toBe(1);
        expect({ a: 1 }).toEqual({ a: 1 });
        expect('hello').toContain('ell');
    });

    it('should support async tests', async () => {
        await new Promise(r => setTimeout(r, 10));
        expect(true).toBe(true);
    });

    it('should support mocks', () => {
        const fn = vi.fn();
        fn('hello');
        expect(fn.calls.length).toBe(1);
        expect(fn.calls[0][0]).toBe('hello');
    });
});
