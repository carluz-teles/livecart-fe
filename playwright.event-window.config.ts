import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: ["event-window.ui.ts", "event-window.spec.ts"],
  workers: 1,
  reporter: "list",
  timeout: 45_000,
  use: { headless: true, baseURL: "http://127.0.0.1:3218", timezoneId: "America/Sao_Paulo" },
  outputDir: "test-results/event-window",
  webServer: {
    command: "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3218 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3218/event-window",
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
