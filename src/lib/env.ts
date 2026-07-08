// Flags de ambiente do FE (NEXT_PUBLIC_* são inlined no build).
// NEXT_PUBLIC_ENV: "production" | "staging" | undefined (dev local)

// Modo escuro só existe em dev local e staging — produção é sempre light.
export const isDarkModeAllowed = process.env.NEXT_PUBLIC_ENV !== "production"
