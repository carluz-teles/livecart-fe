import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: "operations.spec.ts",
  fullyParallel: true,
  reporter: "list",
})
