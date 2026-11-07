import { defineConfig, devices } from '@playwright/test';

// The family site (tests/) and the family agent evaluation (evals/).
// Chromium only: the pages are checked for what was written, not for
// browser differences, which each project's own tests cover.
export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 120000,
  projects: [
    { name: 'site', testDir: 'tests', use: { ...devices['Desktop Chrome'] } },
    { name: 'evals', testDir: 'evals', use: { ...devices['Desktop Chrome'] } },
  ],
});
