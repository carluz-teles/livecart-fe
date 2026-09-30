import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests", testMatch: "stock-edit.ui.ts", workers: 1, reporter: "list",
  use: { headless: true, baseURL: "http://127.0.0.1:3217", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3217 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3217", reuseExistingServer: false, timeout: 60_000,
  },
})
