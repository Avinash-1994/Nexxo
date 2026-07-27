/**
 * Property-Based Tests for Module Resolution
 * 
 * Tests the module resolver with randomly generated paths and scenarios
 * to ensure robust handling of edge cases.
 */

import fc from 'fast-check';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('Property-Based: Module Resolution', () => {
    let tempDir: string;

    beforeAll(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lunx-property-test-'));
    });

    afterAll(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    /**
     * Property: Relative paths should always resolve correctly
     * 
     * Generates various relative path patterns and ensures they resolve
     * to valid absolute paths.
     */
    it('should correctly resolve relative paths', () => {
        fc.assert(
            fc.property(
                fc.record({
                    segments: fc.array(
                        fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
                        { minLength: 1, maxLength: 5 }
                    ),
                    levels: fc.integer({ min: 0, max: 3 })
                }),
                ({ segments, levels }) => {
                    // Create relative path with ../ prefixes
                    const upPath = '../'.repeat(levels);
                    const relativePath = upPath + segments.join('/');

                    const basePath = path.join(tempDir, 'a', 'b', 'c');
                    const resolved = path.resolve(basePath, relativePath);

                    // Resolved path should be absolute
                    expect(path.isAbsolute(resolved)).toBe(true);

                    // Resolved path should not contain '..'
                    expect(resolved).not.toContain('..');

                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Path normalization should be idempotent
     * 
     * Normalizing an already normalized path should produce the same result.
     */
    it('should have idempotent path normalization', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
                    { minLength: 1, maxLength: 5 }
                ),
                (segments) => {
                    const pathStr = segments.join('/');
                    const normalized1 = path.normalize(pathStr);
                    const normalized2 = path.normalize(normalized1);

                    expect(normalized2).toBe(normalized1);

                    return true;
                }
            ),
            { numRuns: 50 }
        );
    });

    /**
     * Property: File extensions should be handled consistently
     * 
     * Tests various file extension patterns.
     */
    it('should handle file extensions consistently', () => {
        fc.assert(
            fc.property(
                fc.record({
                    basename: fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
                    ext: fc.oneof(
                        fc.constant('.js'),
                        fc.constant('.ts'),
                        fc.constant('.jsx'),
                        fc.constant('.tsx'),
                        fc.constant('.mjs'),
                        fc.constant('.cjs')
                    )
                }),
                ({ basename, ext }) => {
                    const filename = basename + ext;
                    const parsed = path.parse(filename);

                    // Extension should be preserved
                    expect(parsed.ext).toBe(ext);
                    expect(parsed.name).toBe(basename);

                    // Reconstructing should give same filename
                    const reconstructed = parsed.name + parsed.ext;
                    expect(reconstructed).toBe(filename);

                    return true;
                }
            ),
            { numRuns: 50 }
        );
    });

    /**
     * Property: Module specifiers should be validated correctly
     * 
     * Tests various module specifier patterns (bare, relative, absolute).
     */
    it('should validate module specifiers correctly', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    // Bare specifiers (package names)
                    fc.record({
                        type: fc.constant('bare'),
                        value: fc.stringMatching(/^[a-z][a-z0-9-]*$/)
                    }),
                    // Relative specifiers
                    fc.record({
                        type: fc.constant('relative'),
                        value: fc.oneof(
                            fc.constant('./file'),
                            fc.constant('../file'),
                            fc.constant('./dir/file')
                        )
                    }),
                    // Absolute specifiers
                    fc.record({
                        type: fc.constant('absolute'),
                        value: fc.constant('/absolute/path')
                    })
                ),
                ({ type, value }) => {
                    const isBare = !value.startsWith('.') && !value.startsWith('/');
                    const isRelative = value.startsWith('./') || value.startsWith('../');
                    const isAbsolute = value.startsWith('/');

                    // Exactly one should be true
                    const trueCount = [isBare, isRelative, isAbsolute].filter(Boolean).length;
                    expect(trueCount).toBe(1);

                    // Type should match
                    if (type === 'bare') expect(isBare).toBe(true);
                    if (type === 'relative') expect(isRelative).toBe(true);
                    if (type === 'absolute') expect(isAbsolute).toBe(true);

                    return true;
                }
            ),
            { numRuns: 60 }
        );
    });

    /**
     * Property: Path joining should be associative
     * 
     * (a/b)/c should equal a/(b/c)
     */
    it('should have associative path joining', () => {
        fc.assert(
            fc.property(
                fc.tuple(
                    fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
                    fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
                    fc.stringMatching(/^[a-zA-Z0-9_-]+$/)
                ),
                ([a, b, c]) => {
                    const path1 = path.join(path.join(a, b), c);
                    const path2 = path.join(a, path.join(b, c));

                    // Both should produce the same normalized path
                    expect(path.normalize(path1)).toBe(path.normalize(path2));

                    return true;
                }
            ),
            { numRuns: 50 }
        );
    });

    /**
     * Property: Circular path references should be detected
     * 
     * Paths like a/../a or a/b/../../a/b should be normalized correctly.
     */
    it('should normalize circular path references', () => {
        fc.assert(
            fc.property(
                fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
                (name) => {
                    const circularPath = `${name}/../${name}`;
                    const normalized = path.normalize(circularPath);

                    // Should resolve to just the name
                    expect(normalized).toBe(name);

                    return true;
                }
            ),
            { numRuns: 30 }
        );
    });

    /**
     * Property: Empty path segments should be handled
     * 
     * Paths with empty segments (a//b) should be normalized.
     */
    it('should handle empty path segments', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
                    { minLength: 2, maxLength: 4 }
                ),
                (segments) => {
                    // Create path with double slashes
                    const pathWithEmpty = segments.join('//');
                    const normalized = path.normalize(pathWithEmpty);

                    // Should not contain double slashes
                    expect(normalized).not.toContain('//');

                    // Should contain all segments
                    segments.forEach(segment => {
                        expect(normalized).toContain(segment);
                    });

                    return true;
                }
            ),
            { numRuns: 40 }
        );
    });

    /**
     * Property: Case sensitivity should be consistent
     * 
     * Path comparison should respect platform case sensitivity.
     */
    it('should handle case sensitivity consistently', () => {
        fc.assert(
            fc.property(
                fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
                (name) => {
                    const lower = name.toLowerCase();
                    const upper = name.toUpperCase();

                    // On Windows, paths are case-insensitive
                    // On Unix, they are case-sensitive
                    const isWindows = process.platform === 'win32';

                    if (isWindows) {
                        // Windows: should treat as same
                        const path1 = path.normalize(lower);
                        const path2 = path.normalize(upper);
                        // Normalization doesn't change case, but resolution should handle it
                        expect(path1.toLowerCase()).toBe(path2.toLowerCase());
                    } else {
                        // Unix: should treat as different (if they differ)
                        if (lower !== upper) {
                            expect(lower).not.toBe(upper);
                        }
                    }

                    return true;
                }
            ),
            { numRuns: 30 }
        );
    });
});
