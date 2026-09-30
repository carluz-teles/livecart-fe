import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: ["log-audit.ui.ts", "stock-edit.ui.ts", "erp-import.audit.ts"],
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  use: { headless: true, baseURL: "http://127.0.0.1:3214" },
  outputDir: "test-results/log-audit",
  webServer: {
    command: "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3214 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3214",
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
