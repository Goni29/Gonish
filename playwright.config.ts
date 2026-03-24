import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'Desktop Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'Tablet Safari',
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
