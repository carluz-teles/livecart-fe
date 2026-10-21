import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: "comment-recovery.ui.ts",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3221", headless: true },
  outputDir: "test-results/audit-fixes",
  webServer: {
    command: "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3221 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3221/comments",
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
