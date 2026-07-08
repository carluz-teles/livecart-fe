import { AppProviders } from "@/components/providers/app-providers"

// Rota autenticada: nunca pode ser prerenderizada nem cacheada publicamente.
// Sem isto o edge do Railway às vezes serve o payload RSC (text/x-component)
// sob a URL de HTML no hard-load/F5 — a tela vira texto cru. Mesmo fix do
// (dashboard)/layout.tsx.
export const dynamic = "force-dynamic"

export default function AcceptInviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppProviders>{children}</AppProviders>
}
