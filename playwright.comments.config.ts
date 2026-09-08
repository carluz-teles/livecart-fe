import { defineConfig } from "@playwright/test"

// Testes de comportamento dos dados da aba, sem autenticação, servidor ou API.
export default defineConfig({
  testDir: "./tests",
  testMatch: "event-comments.spec.ts",
  fullyParallel: true,
  reporter: "list",
})
