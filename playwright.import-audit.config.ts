import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: "erp-import.audit.ts",
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  use: { headless: true, baseURL: "http://127.0.0.1:3211" },
  outputDir: "test-results/erp-import",
  webServer: {
    command: "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3211 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3211",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
