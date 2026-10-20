import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests", testMatch: /marketing\.(ui|unit)\.ts/, workers: 1,
  timeout: 60_000, reporter: "list", outputDir: "test-results/marketing",
  use: { baseURL: "http://127.0.0.1:3227", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", testMatch: "marketing.ui.ts", use: { ...devices["Pixel 7"] } },
    { name: "webkit", testMatch: "marketing.ui.ts", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev -- --port 3227 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3227", reuseExistingServer: false, timeout: 120_000,
  },
})
