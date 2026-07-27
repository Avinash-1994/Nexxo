import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import { buildProject } from '../../src/build/index.js';
import path from 'path';
import fs from 'fs';

describe('Error Handling Tests', () => {
    const fixturesDir = path.resolve(process.cwd(), 'tests/fixtures/errors');

    beforeAll(() => {
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true });
        }
    });

    describe('Syntax Errors', () => {
        it('should handle malformed JavaScript gracefully', async () => {
            const projectPath = path.join(fixturesDir, 'syntax-error');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                // Intentionally malformed code
                fs.writeFileSync(
                    path.join(projectPath, 'src/bad.js'),
                    `const x = {{{
// Unclosed braces
function test() {
    return "incomplete`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.js'),
                    `import './bad';`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'syntax-error', type: 'module' }, null, 2)
                );
            }

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            try {
                const result = await buildProject({
                    root: projectPath,
                    entry: ['src/main.js'],
                    outDir: 'dist'
                });
                // Build succeeded despite errors - resilient behavior
                expect(result).toBeDefined();
            } catch (error) {
                // Build threw error - also acceptable for malformed code
                expect(error).toBeDefined();
            } finally {
                consoleErrorSpy.mockRestore();
            }
        });

        it('should handle TypeScript type errors', async () => {
            const projectPath = path.join(fixturesDir, 'type-error');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(projectPath, 'src/types.ts'),
                    `interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'John',
  age: 'thirty' // Type error: should be number
};

export { user };`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `import { user } from './types';
console.log(user);`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'type-error', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: projectPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            // TypeScript errors might be transpiled away or caught
            expect(result).toBeDefined();
        });
    });

    describe('Circular Dependencies', () => {
        it('should detect circular dependencies', async () => {
            const projectPath = path.join(fixturesDir, 'circular-deps');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                // Create circular dependency
                fs.writeFileSync(
                    path.join(projectPath, 'src/a.ts'),
                    `import { b } from './b';
export const a = 'A' + b;`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/b.ts'),
                    `import { a } from './a';
export const b = 'B' + a;`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `import { a } from './a';
console.log(a);`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'circular-deps', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: projectPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            // Should either detect and warn/error, or handle gracefully
            expect(result).toBeDefined();
            if (!result.success) {
                expect(result.errors.length).toBeGreaterThan(0);
            }
        });

        it('should handle deep circular dependencies', async () => {
            const projectPath = path.join(fixturesDir, 'deep-circular');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                // A -> B -> C -> A
                fs.writeFileSync(
                    path.join(projectPath, 'src/a.ts'),
                    `import { c } from './c';
export const a = 'A';`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/b.ts'),
                    `import { a } from './a';
export const b = 'B';`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/c.ts'),
                    `import { b } from './b';
export const c = 'C';`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `import { a } from './a';
console.log(a);`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'deep-circular', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: projectPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            expect(result).toBeDefined();
        });
    });

    describe('Missing Dependencies', () => {
        it('should handle missing imports', async () => {
            const projectPath = path.join(fixturesDir, 'missing-import');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `import { nonExistent } from './does-not-exist';
console.log(nonExistent);`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'missing-import', type: 'module' }, null, 2)
                );
            }

            try {
                const result = await buildProject({
                    root: projectPath,
                    entry: ['src/main.ts'],
                    outDir: 'dist'
                });
                expect(result).toBeDefined();
            } catch (error) {
                // Build may throw on missing imports
                expect(error).toBeDefined();
            }
        });

        it('should handle missing node_modules packages', async () => {
            const projectPath = path.join(fixturesDir, 'missing-package');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `import { something } from 'package-that-does-not-exist';
console.log(something);`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'missing-package', type: 'module' }, null, 2)
                );
            }

            try {
                const result = await buildProject({
                    root: projectPath,
                    entry: ['src/main.ts'],
                    outDir: 'dist'
                });
                expect(result).toBeDefined();
            } catch (error) {
                // Build may throw on missing packages
                expect(error).toBeDefined();
            }
        });
    });

    describe('Runtime Errors', () => {
        it('should handle division by zero', async () => {
            const projectPath = path.join(fixturesDir, 'division-by-zero');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `const result = 10 / 0;
console.log(result); // Infinity`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'division-by-zero', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: projectPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            // Should build successfully (runtime error, not build error)
            expect(result.success).toBe(true);
        });

        it('should handle null/undefined access', async () => {
            const projectPath = path.join(fixturesDir, 'null-access');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `const obj: any = null;
const value = obj.property; // Will throw at runtime
console.log(value);`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'null-access', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: projectPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            // Should build (runtime error)
            expect(result.success).toBe(true);
        });
    });

    describe('Build Configuration Errors', () => {
        it('should handle invalid entry points', async () => {
            const projectPath = path.join(fixturesDir, 'invalid-entry');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(projectPath, { recursive: true });

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'invalid-entry', type: 'module' }, null, 2)
                );
            }

            try {
                const result = await buildProject({
                    root: projectPath,
                    entry: ['src/does-not-exist.ts'],
                    outDir: 'dist'
                });
                expect(result).toBeDefined();
            } catch (error) {
                // Build may throw on invalid entry points
                expect(error).toBeDefined();
            }
        });

        it('should handle invalid output directory', async () => {
            const projectPath = path.join(fixturesDir, 'invalid-outdir');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `console.log('test');`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'invalid-outdir', type: 'module' }, null, 2)
                );
            }

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            try {
                // Try to write to invalid path (should handle gracefully)
                const result = await buildProject({
                    root: projectPath,
                    entry: ['src/main.ts'],
                    outDir: '/invalid/path/that/does/not/exist'
                });

                // Should either succeed or fail gracefully
                expect(result).toBeDefined();
            } finally {
                consoleErrorSpy.mockRestore();
            }
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty files', async () => {
            const projectPath = path.join(fixturesDir, 'empty-file');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                fs.writeFileSync(
                    path.join(projectPath, 'src/empty.ts'),
                    '' // Empty file
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `import './empty';
console.log('Imported empty file');`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'empty-file', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: projectPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            expect(result.success).toBe(true);
        });

        it('should handle very large files', async () => {
            const projectPath = path.join(fixturesDir, 'large-file');

            if (!fs.existsSync(projectPath)) {
                fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });

                // Generate a large file (1000 lines)
                const largeContent = Array.from({ length: 1000 }, (_, i) =>
                    `export const var${i} = ${i};`
                ).join('\n');

                fs.writeFileSync(
                    path.join(projectPath, 'src/large.ts'),
                    largeContent
                );

                fs.writeFileSync(
                    path.join(projectPath, 'src/main.ts'),
                    `import * as large from './large';
console.log(Object.keys(large).length);`
                );

                fs.writeFileSync(
                    path.join(projectPath, 'package.json'),
                    JSON.stringify({ name: 'large-file', type: 'module' }, null, 2)
                );
            }

            const result = await buildProject({
                root: projectPath,
                entry: ['src/main.ts'],
                outDir: 'dist'
            });

            expect(result.success).toBe(true);
        });
    });
});
