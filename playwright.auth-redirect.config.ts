import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  testMatch: "auth-redirect.unit.ts",
  workers: 1,
  reporter: "list",
  outputDir: "test-results/auth-redirect",
})
