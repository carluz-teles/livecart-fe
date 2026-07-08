import { Sidebar } from "@/components/shared/Sidebar"
import { Header } from "@/components/shared/Header"
import { TrialBanner } from "@/components/shared/TrialBanner"
import { AppProviders } from "@/components/providers/app-providers"

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
      <div className="flex h-screen overflow-hidden">
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
    </AppProviders>
  )
}
