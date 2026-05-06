export const communicationsKeys = {
  all: ["communications"] as const,
  settings: () => [...communicationsKeys.all, "settings"] as const,
  variables: () => [...communicationsKeys.all, "variables"] as const,
  testRecipient: () => [...communicationsKeys.all, "test-recipient"] as const,
}
