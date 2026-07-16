export const communicationsKeys = {
  all: ["communications"] as const,
  settings: () => [...communicationsKeys.all, "settings"] as const,
  variables: (type?: string) =>
    [...communicationsKeys.all, "variables", type ?? "all"] as const,
  testRecipient: () => [...communicationsKeys.all, "test-recipient"] as const,
}
