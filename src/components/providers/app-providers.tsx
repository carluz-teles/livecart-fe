"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { UserProvider } from "@/components/providers/user-provider"
import { AuthTokenBridge } from "@/components/providers/auth-token-bridge"
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
        {/* Dentro do ClerkProvider (precisa de useAuth) e ACIMA do
            QueryProvider: as consultas do React Query passam pelo cliente
            HTTP, e ele só sabe renovar token se a ponte já estiver
            registrada quando a primeira requisição sair. */}
        <AuthTokenBridge />
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
