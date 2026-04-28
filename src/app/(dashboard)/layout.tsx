import { Sidebar } from "@/components/shared/Sidebar"
import { Header } from "@/components/shared/Header"
import { AppProviders } from "@/components/providers/app-providers"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProviders>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-surface-secondary p-6">
            {children}
          </main>
        </div>
      </div>
    </AppProviders>
  )
}
