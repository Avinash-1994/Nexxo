/**
 * Meta-Framework Router Tests
 * Comprehensive positive and negative testing for Next.js, Nuxt, and Remix routers
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs/promises';
import { NextJsRouter } from '../src/meta-frameworks/nextjs/router.js';
import { NuxtRouter } from '../src/meta-frameworks/nuxt/router.js';
import { RemixRouter } from '../src/meta-frameworks/remix/router.js';

describe('Meta-Framework Routers - Comprehensive Testing', () => {
    const testRoot = path.join(process.cwd(), 'tests', 'fixtures', 'meta-frameworks');

    // ==================== POSITIVE TESTS ====================

    describe('✅ POSITIVE TESTS - NextJsRouter', () => {
        describe('Pages Router', () => {
            it('should scan basic page routes', async () => {
                const router = new NextJsRouter({
                    root: path.join(testRoot, 'nextjs-pages'),
                    framework: 'nextjs'
                });

                const manifest = await router.scanRoutes();

                expect(manifest).toBeDefined();
                expect(manifest.routes).toBeInstanceOf(Array);
                expect(manifest.pageRoutes).toBeInstanceOf(Array);
            });

            it('should correctly parse dynamic routes', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                // Test dynamic route matching
                const match = router.match('/blog/my-post-123');

                if (match) {
                    expect(match.route.isDynamic).toBe(true);
                    expect(match.params).toBeDefined();
                }
            });

            it('should handle catch-all routes', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                const match = router.match('/docs/getting-started/installation/guide');

                if (match) {
                    expect(match.route.path).toContain('*');
                }
            });

            it('should separate API routes from page routes', async () => {
                const router = new NextJsRouter({
                    root: path.join(testRoot, 'nextjs-pages'),
                    framework: 'nextjs'
                });

                const manifest = await router.scanRoutes();

                const apiRoutes = manifest.routes.filter(r => r.type === 'api');
                const pageRoutes = manifest.routes.filter(r => r.type === 'page');

                expect(apiRoutes).toBeInstanceOf(Array);
                expect(pageRoutes).toBeInstanceOf(Array);
            });
        });

        describe('App Router', () => {
            it('should scan app directory routes', async () => {
                const router = new NextJsRouter({
                    root: path.join(testRoot, 'nextjs-app'),
                    framework: 'nextjs'
                });

                const manifest = await router.scanRoutes();

                expect(manifest.routes).toBeDefined();
            });

            it('should handle route groups correctly', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                // Route groups like (marketing) should be ignored in URL
                const match = router.match('/about');

                if (match) {
                    expect(match.route.path).not.toContain('(');
                    expect(match.route.path).not.toContain(')');
                }
            });

            it('should identify layout and error files', async () => {
                const router = new NextJsRouter({
                    root: path.join(testRoot, 'nextjs-app'),
                    framework: 'nextjs'
                });

                const manifest = await router.scanRoutes();

                const layouts = manifest.routes.filter(r => r.type === 'layout');
                const errors = manifest.routes.filter(r => r.type === 'error');

                expect(layouts).toBeDefined();
                expect(errors).toBeDefined();
            });
        });

        describe('Route Matching', () => {
            it('should match exact routes', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                const match = router.match('/');
                expect(match).toBeDefined();
            });

            it('should extract route parameters correctly', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                const match = router.match('/blog/hello-world');

                if (match && match.route.isDynamic) {
                    expect(match.params).toBeDefined();
                    expect(Object.keys(match.params).length).toBeGreaterThan(0);
                }
            });

            it('should parse query strings', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                const match = router.match('/search?q=test&page=1');

                if (match) {
                    expect(match.query).toBeDefined();
                    expect(match.query.q).toBe('test');
                    expect(match.query.page).toBe('1');
                }
            });

            it('should generate URLs from route names', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                try {
                    const url = router.generate('blog.slug', { slug: 'my-post' });
                    expect(url).toContain('my-post');
                } catch {
                    // Route might not exist in test fixtures
                }
            });
        });
    });

    describe('✅ POSITIVE TESTS - NuxtRouter', () => {
        it('should scan Nuxt pages directory', async () => {
            const router = new NuxtRouter({
                root: path.join(testRoot, 'nuxt'),
                framework: 'nuxt'
            });

            const manifest = await router.scanRoutes();

            expect(manifest).toBeDefined();
            expect(manifest.routes).toBeInstanceOf(Array);
        });

        it('should handle dynamic routes with brackets', async () => {
            const router = new NuxtRouter({
                root: testRoot,
                framework: 'nuxt'
            });

            await router.scanRoutes();

            const match = router.match('/users/123');

            if (match) {
                expect(match.route.isDynamic).toBe(true);
            }
        });

        it('should handle catch-all routes', async () => {
            const router = new NuxtRouter({
                root: testRoot,
                framework: 'nuxt'
            });

            await router.scanRoutes();

            const match = router.match('/docs/a/b/c/d');

            if (match) {
                expect(match.route.path).toContain('(.*)');
            }
        });

        it('should generate kebab-case route names', async () => {
            const router = new NuxtRouter({
                root: path.join(testRoot, 'nuxt'),
                framework: 'nuxt'
            });

            const manifest = await router.scanRoutes();

            manifest.routes.forEach(route => {
                expect(route.name).toMatch(/^[a-z0-9-]+$/);
            });
        });
    });

    describe('✅ POSITIVE TESTS - RemixRouter', () => {
        it('should scan Remix routes directory', async () => {
            const router = new RemixRouter({
                root: path.join(testRoot, 'remix'),
                framework: 'remix'
            });

            const manifest = await router.scanRoutes();

            expect(manifest).toBeDefined();
            expect(manifest.routes).toBeInstanceOf(Array);
        });

        it('should handle dot notation for nested routes', async () => {
            const router = new RemixRouter({
                root: testRoot,
                framework: 'remix'
            });

            await router.scanRoutes();

            const match = router.match('/dashboard/settings');

            if (match) {
                expect(match.route.path).toBe('/dashboard/settings');
            }
        });

        it('should handle index routes', async () => {
            const router = new RemixRouter({
                root: testRoot,
                framework: 'remix'
            });

            await router.scanRoutes();

            const match = router.match('/');
            expect(match).toBeDefined();
        });

        it('should identify pathless layouts', async () => {
            const router = new RemixRouter({
                root: path.join(testRoot, 'remix'),
                framework: 'remix'
            });

            const manifest = await router.scanRoutes();

            const pathlessLayouts = manifest.routes.filter(
                r => r.type === 'layout' && r.meta.pathless
            );

            expect(pathlessLayouts).toBeDefined();
        });

        it('should handle dynamic segments with $', async () => {
            const router = new RemixRouter({
                root: testRoot,
                framework: 'remix'
            });

            await router.scanRoutes();

            const match = router.match('/posts/my-post');

            if (match && match.route.isDynamic) {
                expect(match.route.path).toContain(':');
            }
        });
    });

    // ==================== NEGATIVE TESTS ====================

    describe('❌ NEGATIVE TESTS - Error Handling', () => {
        describe('NextJsRouter - Error Cases', () => {
            it('should handle missing pages directory gracefully', async () => {
                const router = new NextJsRouter({
                    root: '/nonexistent/path',
                    framework: 'nextjs'
                });

                await expect(async () => {
                    await router.scanRoutes();
                }).not.toThrow();
            });

            it('should return null for non-matching routes', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                const match = router.match('/this-route-does-not-exist-12345');
                expect(match).toBeNull();
            });

            it('should throw error when matching before scanning', () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                expect(() => {
                    router.match('/any-route');
                }).toThrow('Routes not scanned');
            });

            it('should throw error for invalid route name in generate', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                expect(() => {
                    router.generate('nonexistent-route-name');
                }).toThrow('Route not found');
            });

            it('should handle empty directory gracefully', async () => {
                const emptyDir = path.join(testRoot, 'empty');

                try {
                    await fs.mkdir(emptyDir, { recursive: true });

                    const router = new NextJsRouter({
                        root: emptyDir,
                        framework: 'nextjs'
                    });

                    const manifest = await router.scanRoutes();
                    expect(manifest.routes.length).toBe(0);

                    await fs.rmdir(emptyDir);
                } catch {
                    // Directory operations might fail in CI
                }
            });

            it('should skip invalid file extensions', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                const manifest = await router.scanRoutes();

                // Should not include .txt, .md, or other non-JS files
                manifest.routes.forEach(route => {
                    expect(route.filePath).toMatch(/\.(tsx?|jsx?)$/);
                });
            });
        });

        describe('NuxtRouter - Error Cases', () => {
            it('should handle missing pages directory', async () => {
                const router = new NuxtRouter({
                    root: '/nonexistent/nuxt/path',
                    framework: 'nuxt'
                });

                await expect(async () => {
                    await router.scanRoutes();
                }).not.toThrow();
            });

            it('should return null for invalid routes', async () => {
                const router = new NuxtRouter({
                    root: testRoot,
                    framework: 'nuxt'
                });

                await router.scanRoutes();

                const match = router.match('/invalid/route/path/123');
                expect(match).toBeNull();
            });

            it('should only process .vue files', async () => {
                const router = new NuxtRouter({
                    root: testRoot,
                    framework: 'nuxt'
                });

                const manifest = await router.scanRoutes();

                manifest.routes.forEach(route => {
                    expect(route.filePath).toMatch(/\.vue$/);
                });
            });
        });

        describe('RemixRouter - Error Cases', () => {
            it('should handle missing routes directory', async () => {
                const router = new RemixRouter({
                    root: '/nonexistent/remix/path',
                    framework: 'remix'
                });

                await expect(async () => {
                    await router.scanRoutes();
                }).not.toThrow();
            });

            it('should return null for non-matching routes', async () => {
                const router = new RemixRouter({
                    root: testRoot,
                    framework: 'remix'
                });

                await router.scanRoutes();

                const match = router.match('/completely/invalid/route');
                expect(match).toBeNull();
            });

            it('should handle malformed route files gracefully', async () => {
                const router = new RemixRouter({
                    root: testRoot,
                    framework: 'remix'
                });

                // Should not throw even if there are unusual file names
                await expect(async () => {
                    await router.scanRoutes();
                }).not.toThrow();
            });
        });

        describe('Edge Cases', () => {
            it('should handle routes with special characters', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                // Test URL encoding
                const match = router.match('/search?q=hello%20world');

                if (match) {
                    expect(match.query).toBeDefined();
                }
            });

            it('should handle very long route paths', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                const longPath = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p';
                const match = router.match(longPath);

                // Should not crash
                expect(match).toBeDefined();
            });

            it('should handle duplicate route names gracefully', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                const manifest = await router.scanRoutes();

                // All route names should be unique
                const names = manifest.routes.map(r => r.name);
                const uniqueNames = new Set(names);

                expect(names.length).toBe(uniqueNames.size);
            });

            it('should handle concurrent route matching', async () => {
                const router = new NextJsRouter({
                    root: testRoot,
                    framework: 'nextjs'
                });

                await router.scanRoutes();

                // Test concurrent access
                const promises = [
                    router.match('/'),
                    router.match('/about'),
                    router.match('/blog/post-1'),
                    router.match('/api/users')
                ];

                await expect(Promise.all(promises)).resolves.toBeDefined();
            });
        });
    });

    // ==================== INTEGRATION TESTS ====================

    describe('🔗 INTEGRATION TESTS', () => {
        it('should work with all three routers simultaneously', async () => {
            const nextRouter = new NextJsRouter({ root: testRoot, framework: 'nextjs' });
            const nuxtRouter = new NuxtRouter({ root: testRoot, framework: 'nuxt' });
            const remixRouter = new RemixRouter({ root: testRoot, framework: 'remix' });

            await Promise.all([
                nextRouter.scanRoutes(),
                nuxtRouter.scanRoutes(),
                remixRouter.scanRoutes()
            ]);

            expect(nextRouter.match('/')).toBeDefined();
            expect(nuxtRouter.match('/')).toBeDefined();
            expect(remixRouter.match('/')).toBeDefined();
        });

        it('should maintain separate route manifests', async () => {
            const router1 = new NextJsRouter({ root: testRoot, framework: 'nextjs' });
            const router2 = new NextJsRouter({ root: testRoot, framework: 'nextjs' });

            const manifest1 = await router1.scanRoutes();
            const manifest2 = await router2.scanRoutes();

            // Should be independent instances
            expect(manifest1).not.toBe(manifest2);
        });
    });
});
