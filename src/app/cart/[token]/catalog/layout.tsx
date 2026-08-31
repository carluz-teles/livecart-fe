import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default function CartCatalogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Mirrors the public checkout layout: opts out of the dashboard's dark mode
  // via `force-light-theme` so shoppers always see the same light UI.
  return (
    <div className="force-light-theme">
      {apiUrl ? (
        <>
          <link rel="preconnect" href={apiUrl} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={apiUrl} />
        </>
      ) : null}
      <QueryProvider>
        {children}
        <Toaster richColors closeButton />
      </QueryProvider>
    </div>
  )
}
