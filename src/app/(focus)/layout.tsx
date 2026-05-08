import { AppProviders } from "@/components/providers/app-providers"

// Routes inside (focus) opt out of the dashboard chrome — no sidebar, no
// header — so editors can use the full viewport. The page itself owns its
// back-navigation (e.g. NotificationEditorHeader links back to the list).
export default function FocusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-surface-secondary p-4 print:bg-white print:p-0">
        {children}
      </div>
    </AppProviders>
  )
}
