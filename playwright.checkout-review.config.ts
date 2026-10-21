import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: ["checkout-review.ui.ts", "checkout-review.unit.ts"],
  workers: 1,
  reporter: "list",
  timeout: 40_000,
  outputDir: "test-results/checkout-review",
  use: { headless: true, baseURL: "http://127.0.0.1:3227" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", testIgnore: "**/*.unit.ts", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3227 --hostname 127.0.0.1",
    env: { CHECKOUT_TEST_API_URL: "http://127.0.0.1:3227/api/v1", FIXTURE_DIST_DIR: ".next-checkout-review" },
    url: "http://127.0.0.1:3227/payment-review",
    reuseExistingServer: false,
    timeout: 90_000,
  },
})
