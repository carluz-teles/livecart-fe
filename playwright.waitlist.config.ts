import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: "waitlist.ui.ts",
  workers: 1,
  reporter: "list",
  use: { headless: true, baseURL: "http://127.0.0.1:3213", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev --prefix test-fixtures/erp-import-ui -- --port 3213 --hostname 127.0.0.1",
    url: "http://127.0.0.1:3213",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
