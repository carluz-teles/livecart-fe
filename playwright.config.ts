import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, 'e2e/.clerk/user.json')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project - runs first
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Main tests - depend on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },

    // Unauthenticated tests (for testing login flow, public pages)
    {
      name: 'chromium-unauthenticated',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*\.unauthenticated\.spec\.ts/,
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
