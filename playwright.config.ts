import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173/Embedded-development-tracker',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node scripts/serve-out.mjs',
    url: 'http://127.0.0.1:4173/Embedded-development-tracker/',
    reuseExistingServer: true,
    timeout: 15000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
