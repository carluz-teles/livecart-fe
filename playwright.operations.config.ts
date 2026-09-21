import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: ["operations.spec.ts", "product-catalog.spec.ts", "billing.spec.ts", "resync-progress.spec.ts", "erp-search.spec.ts", "waitlist.spec.ts"],
  fullyParallel: true,
  reporter: "list",
})
