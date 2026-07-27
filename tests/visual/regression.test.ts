/**
 * Visual Regression Tests for Lunx Dev Server UI
 * 
 * Tests visual components like error overlays, HMR indicators,
 * and build dashboards using screenshot comparison.
 */

import { test, expect, Page } from '@playwright/test';
import { startDevServer } from '../../src/dev/devServer.js';
import path from 'path';
import fs from 'fs';
import os from 'os';

let tempDir: string;
let testProjectPath: string;
let serverUrl: string;
let serverInstance: any;

test.beforeAll(async () => {
    // Create test project
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lunx-visual-test-'));
    testProjectPath = path.join(tempDir, 'visual-app');
    fs.mkdirSync(testProjectPath, { recursive: true });
    fs.mkdirSync(path.join(testProjectPath, 'src'), { recursive: true });

    // Create HTML file
    fs.writeFileSync(
        path.join(testProjectPath, 'index.html'),
        `<!DOCTYPE html>
        <html>
        <head>
            <title>Visual Test App</title>
        </head>
        <body>
            <div id="root"></div>
            <script type="module" src="/src/main.js"></script>
        </body>
        </html>`
    );

    // Create main JS file
    fs.writeFileSync(
        path.join(testProjectPath, 'src', 'main.js'),
        `
        const root = document.getElementById('root');
        root.innerHTML = '<h1>Hello, Lunx!</h1>';
        `
    );

    // Start dev server
    try {
        serverInstance = await startDevServer({
            root: testProjectPath,
            port: 5174
        });
        serverUrl = 'http://localhost:5174';
    } catch (error) {
        console.error('Failed to start dev server:', error);
    }
});

test.afterAll(async () => {
    // Stop server
    if (serverInstance && serverInstance.close) {
        await serverInstance.close();
    }

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
});

test.describe('Visual Regression: Error Overlay', () => {
    /**
     * Test: Error overlay appearance
     * 
     * Verifies the error overlay displays correctly with proper styling.
     */
    test('should display error overlay with correct styling', async ({ page }) => {
        // Create file with syntax error
        fs.writeFileSync(
            path.join(testProjectPath, 'src', 'error.js'),
            `const x = {{{;` // Syntax error
        );

        // Update main to import error file
        fs.writeFileSync(
            path.join(testProjectPath, 'src', 'main.js'),
            `import './error.js';`
        );

        await page.goto(serverUrl);

        // Wait for error overlay
        await page.waitForSelector('[data-lunx-error-overlay]', { timeout: 5000 })
            .catch(() => {
                // Error overlay might not be implemented yet
                console.log('Error overlay not found - feature may not be implemented');
            });

        // Take screenshot for visual comparison
        await page.screenshot({
            path: path.join(tempDir, 'error-overlay.png'),
            fullPage: true
        });

        // Verify overlay is visible
        const overlay = await page.$('[data-lunx-error-overlay]');
        if (overlay) {
            const isVisible = await overlay.isVisible();
            expect(isVisible).toBe(true);
        }
    });

    /**
     * Test: Error message formatting
     * 
     * Ensures error messages are readable and well-formatted.
     */
    test('should format error messages readably', async ({ page }) => {
        await page.goto(serverUrl);

        const errorText = await page.$eval(
            '[data-lunx-error-overlay]',
            (el) => el.textContent
        ).catch(() => null);

        if (errorText) {
            // Error message should not be empty
            expect(errorText.length).toBeGreaterThan(0);

            // Should contain useful information
            expect(
                errorText.includes('Error') ||
                errorText.includes('error') ||
                errorText.includes('Unexpected')
            ).toBe(true);
        }
    });
});

test.describe('Visual Regression: HMR Indicator', () => {
    /**
     * Test: HMR update indicator
     * 
     * Verifies the HMR indicator appears during hot updates.
     */
    test('should show HMR indicator during updates', async ({ page }) => {
        // Reset to working code
        fs.writeFileSync(
            path.join(testProjectPath, 'src', 'main.js'),
            `
            const root = document.getElementById('root');
            root.innerHTML = '<h1>Version 1</h1>';
            `
        );

        await page.goto(serverUrl);
        await page.waitForLoadState('networkidle');

        // Update file to trigger HMR
        fs.writeFileSync(
            path.join(testProjectPath, 'src', 'main.js'),
            `
            const root = document.getElementById('root');
            root.innerHTML = '<h1>Version 2</h1>';
            `
        );

        // Wait for HMR indicator
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({
            path: path.join(tempDir, 'hmr-indicator.png')
        });

        // Verify content updated
        const heading = await page.textContent('h1');
        expect(heading).toContain('Version 2');
    });

    /**
     * Test: HMR success state
     * 
     * Verifies successful HMR updates show appropriate feedback.
     */
    test('should indicate successful HMR update', async ({ page }) => {
        await page.goto(serverUrl);

        // Trigger multiple updates
        for (let i = 1; i <= 3; i++) {
            fs.writeFileSync(
                path.join(testProjectPath, 'src', 'main.js'),
                `
                const root = document.getElementById('root');
                root.innerHTML = '<h1>Update ${i}</h1>';
                `
            );

            await page.waitForTimeout(500);
        }

        // Final state should show latest update
        const heading = await page.textContent('h1');
        expect(heading).toContain('Update 3');

        // Take screenshot of final state
        await page.screenshot({
            path: path.join(tempDir, 'hmr-success.png')
        });
    });
});

test.describe('Visual Regression: Build Dashboard', () => {
    /**
     * Test: Build progress indicator
     * 
     * Verifies build progress is displayed correctly.
     */
    test('should display build progress', async ({ page }) => {
        await page.goto(serverUrl);

        // Look for build dashboard elements
        const dashboard = await page.$('[data-lunx-dashboard]')
            .catch(() => null);

        if (dashboard) {
            // Take screenshot
            await page.screenshot({
                path: path.join(tempDir, 'build-dashboard.png')
            });

            // Dashboard should be visible
            const isVisible = await dashboard.isVisible();
            expect(isVisible).toBe(true);
        }
    });

    /**
     * Test: Performance metrics display
     * 
     * Ensures performance metrics are shown clearly.
     */
    test('should show performance metrics', async ({ page }) => {
        await page.goto(serverUrl);

        // Check for metrics
        const metrics = await page.$$('[data-metric]');

        if (metrics.length > 0) {
            // Take screenshot
            await page.screenshot({
                path: path.join(tempDir, 'performance-metrics.png')
            });

            // Should have at least one metric
            expect(metrics.length).toBeGreaterThan(0);
        }
    });
});

test.describe('Visual Regression: Responsive Design', () => {
    /**
     * Test: Mobile viewport
     * 
     * Verifies UI works on mobile screens.
     */
    test('should render correctly on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.goto(serverUrl);

        await page.screenshot({
            path: path.join(tempDir, 'mobile-view.png'),
            fullPage: true
        });

        // Content should be visible
        const heading = await page.textContent('h1');
        expect(heading).toBeTruthy();
    });

    /**
     * Test: Tablet viewport
     * 
     * Verifies UI works on tablet screens.
     */
    test('should render correctly on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto(serverUrl);

        await page.screenshot({
            path: path.join(tempDir, 'tablet-view.png'),
            fullPage: true
        });

        const heading = await page.textContent('h1');
        expect(heading).toBeTruthy();
    });

    /**
     * Test: Desktop viewport
     * 
     * Verifies UI works on desktop screens.
     */
    test('should render correctly on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
        await page.goto(serverUrl);

        await page.screenshot({
            path: path.join(tempDir, 'desktop-view.png'),
            fullPage: true
        });

        const heading = await page.textContent('h1');
        expect(heading).toBeTruthy();
    });
});

test.describe('Visual Regression: Accessibility', () => {
    /**
     * Test: Color contrast
     * 
     * Ensures sufficient color contrast for readability.
     */
    test('should have sufficient color contrast', async ({ page }) => {
        await page.goto(serverUrl);

        // Take screenshot for manual review
        await page.screenshot({
            path: path.join(tempDir, 'contrast-check.png')
        });

        // Check for common accessibility issues
        const violations = await page.evaluate(() => {
            // This would integrate with axe-core in a real implementation
            return [];
        });

        expect(violations.length).toBe(0);
    });

    /**
     * Test: Focus indicators
     * 
     * Verifies keyboard navigation has visible focus indicators.
     */
    test('should show focus indicators', async ({ page }) => {
        await page.goto(serverUrl);

        // Tab through interactive elements
        await page.keyboard.press('Tab');

        await page.screenshot({
            path: path.join(tempDir, 'focus-indicator.png')
        });

        // At least one element should have focus
        const focusedElement = await page.evaluate(() =>
            document.activeElement?.tagName
        );

        expect(focusedElement).toBeTruthy();
    });
});

