import { defineConfig, devices } from '@playwright/test';

/**
 * Ayanda Mabaso - Playwright Test Configuration
 *
 * Run tests with:
 *   npx playwright test              # Run all tests
 *   npx playwright test --ui         # Run with UI
 *   npx playwright test --headed     # See browser
 *   npx playwright show-report       # View report
 *
 * Test against different environments:
 *   TEST_URL=http://localhost:5176 npx playwright test       # Local
 *   TEST_URL=https://d1s5gxldjthzj1.cloudfront.net npx playwright test  # UAT
 */

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list']
  ],

  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:5176',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  /* Test timeout */
  timeout: 30000,
  expect: {
    timeout: 10000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run local dev server before tests if not testing against deployed URL */
  webServer: process.env.TEST_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
