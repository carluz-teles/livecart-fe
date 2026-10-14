import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: "landing.ui.ts",
  workers: 1,
  reporter: "list",
  timeout: 40_000,
  outputDir: "test-results/landing",
  use: { baseURL: "http://127.0.0.1:3216", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    { name: "webkit", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev --prefix test-fixtures/landing-ui -- --port 3216 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3216",
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
