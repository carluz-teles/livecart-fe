import { Sidebar } from "@/components/shared/Sidebar"
import { Header } from "@/components/shared/Header"
import { TrialBanner } from "@/components/shared/TrialBanner"
import { AppProviders } from "@/components/providers/app-providers"

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
