import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'mobile-qa.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'off',
    trace: 'off',
  },

  projects: [
    {
      name: 'iPhone-13',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'iPhone-13-Pro-Max',
      use: {
        ...devices['iPhone 13 Pro Max'],
      },
    },
    {
      name: 'iPhone-SE',
      use: {
        ...devices['iPhone SE'],
      },
    },
    {
      name: 'iPad-gen7',
      use: {
        ...devices['iPad (gen 7)'],
      },
    },
    {
      name: 'Pixel-5',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Galaxy-S9-Plus',
      use: {
        ...devices['Galaxy S9+'],
      },
    },
  ],
});
