import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: true,
      categories: [
        {
          name: 'Ignored tests',
          matchedStatuses: ['skipped'],
        },
        {
          name: 'Infrastructure problems',
          matchedStatuses: ['broken', 'failed'],
          messageRegex: /.*timeout.*|.*network.*|.*connection.*/i,
        },
        {
          name: 'Outdated tests',
          matchedStatuses: ['broken'],
          messageRegex: /.*element.*not found.*|.*selector.*not found.*/i,
        },
        {
          name: 'Product defects',
          matchedStatuses: ['failed'],
          messageRegex: /.*expect.*toBe.*|.*expected.*but got.*/i,
        },
        {
          name: 'Test defects',
          matchedStatuses: ['broken'],
        },
        {
          name: 'Critical severity failures',
          matchedStatuses: ['failed'],
          traceRegex: /.*critical.*/i,
        },
      ],
      environmentInfo: {
        framework: 'playwright',
        node_version: process.version,
      },
    }]
  ],
  use: {
    baseURL: 'https://mini-api.local',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'ng serve',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
