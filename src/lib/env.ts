// Flags de ambiente do FE (NEXT_PUBLIC_* são inlined no build).

// Modo escuro é opt-in por ambiente: só existe onde a flag for "true"
// (dev local e staging). Sem a flag — inclusive se esquecerem de setar em
// produção — o tema fica travado em light.
export const isDarkModeAllowed = process.env.NEXT_PUBLIC_DARK_THEME_ENABLED === "true"
