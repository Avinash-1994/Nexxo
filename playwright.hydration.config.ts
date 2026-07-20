import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for TD-013 — SSR Hydration Tests
 * Tests: HYD-01 through HYD-09
 *
 * One test per framework, Chromium only, sequential execution.
 * Each test spins up its own static file server.
 */
export default defineConfig({
    testDir: './e2e/playwright',

    /* Run tests sequentially — each test manages its own server */
    fullyParallel: false,
    workers: 1,

    timeout: 45000,

    /* No retries for hydration tests — failures are deterministic */
    retries: 0,

    /* Fail on test.only in CI */
    forbidOnly: !!process.env.CI,

    /* Reporter */
    reporter: [['list'], ['html', { outputFolder: 'playwright-report-hydration', open: 'never' }]],

    /* Shared settings */
    use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        navigationTimeout: 15000,
        actionTimeout: 10000,
    },

    /* Chromium only for TD-013 */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
