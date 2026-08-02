"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { UserProvider } from "@/components/providers/user-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { clerkAppearance } from "@/lib/clerk-theme"
// Clerk-specific CSS lives in its own file so the public checkout (/cart)
// doesn't ship those rules.
import "@/app/clerk-styles.css"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptBR} appearance={clerkAppearance}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>
          {/* Provider único de tooltip para o painel inteiro. Cada componente
              montar o seu deixava o delay de abertura inconsistente entre
              telas — e um Tooltip sem Provider ancestral simplesmente não
              abre. */}
          <TooltipProvider delayDuration={200}>
            <UserProvider>{children}</UserProvider>
          </TooltipProvider>
          <Toaster richColors closeButton />
        </QueryProvider>
      </ThemeProvider>
    </ClerkProvider>
  )
}
