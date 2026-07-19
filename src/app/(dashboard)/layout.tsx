import { Sidebar } from "@/components/shared/Sidebar"
import { Header } from "@/components/shared/Header"
import { TrialBanner } from "@/components/shared/TrialBanner"
import { AppProviders } from "@/components/providers/app-providers"
import { OnboardingGuard } from "@/components/providers/onboarding-guard"

// Authenticated, per-merchant área: nunca pode ser prerenderizada nem
// cacheada publicamente. Sem isto, o Next gera estes routes como estáticos
// (x-nextjs-prerender) e o edge do Railway acaba servindo o payload RSC
// (text/x-component) sob a URL de HTML no hard-load/F5 — a tela quebrada.
// force-dynamic alinha o segmento com o comportamento do "/" (no-store).
export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProviders>
      <OnboardingGuard>
      {/* fixed inset-0 em vez de h-screen: 100vh não é exatamente a altura
          visível do viewport, e a sobra (8px medidos em produção) fazia o
          documento rolar junto com o <main> — duas barras de rolagem lado a
          lado no canto direito. Fora do fluxo, o shell é sempre o viewport
          exato e só o <main> rola. print:static devolve o fluxo normal na
          impressão, senão só a primeira página sairia. */}
      <div className="fixed inset-0 flex overflow-hidden print:static print:h-auto print:overflow-visible">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <TrialBanner />
          <div className="print:hidden">
            <Header />
          </div>
          <main className="flex-1 overflow-y-auto bg-surface-secondary p-6 print:overflow-visible print:bg-white print:p-0">
            {children}
          </main>
        </div>
      </div>
      </OnboardingGuard>
    </AppProviders>
  )
}
