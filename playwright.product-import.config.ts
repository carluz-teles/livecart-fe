import { defineConfig, devices } from "@playwright/test"
export default defineConfig({
  testDir: "./tests",
  testMatch: ["product-import.unit.ts", "product-import.ui.ts"],
  workers: 1,
  reporter: "list",
  timeout: 45_000,
  outputDir: "test-results/product-import",
  use: { headless: true, baseURL: "http://127.0.0.1:3220" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      testIgnore: "**/*.unit.ts",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command:
      "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3220 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3220",
    reuseExistingServer: false,
    timeout: 90_000,
  },
})
