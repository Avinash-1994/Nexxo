import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  timeout: 60000,
  use: { headless: true },
  reporter: [['list'], ['html', { open: 'never' }]],
});
