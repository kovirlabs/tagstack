import { defineConfig, devices } from '@playwright/test';

// The family agent evaluation (evals/). Chromium only: the pages are checked
// for what the agents wrote, not for browser differences, which each
// project's own tests cover.
export default defineConfig({
  testDir: 'evals',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 120000,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
