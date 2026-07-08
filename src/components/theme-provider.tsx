"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import { isDarkModeAllowed } from "@/lib/env"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Produção é sempre light: forcedTheme ignora localStorage e preferência
  // do sistema (quem já tinha "dark" salvo também vê light).
  return (
    <NextThemesProvider {...props} forcedTheme={isDarkModeAllowed ? undefined : "light"}>
      {children}
    </NextThemesProvider>
  )
}
