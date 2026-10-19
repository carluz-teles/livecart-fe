import { defineConfig, devices } from "@playwright/test"
import importAudit from "./playwright.import-audit.config"

export default defineConfig({
  ...importAudit,
  testMatch: "erp-health.ui.ts",
  outputDir: "test-results/integration-diagnostics",
  webServer: {
    command: "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3211 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3211",
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
})
