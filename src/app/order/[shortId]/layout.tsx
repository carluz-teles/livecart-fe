import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Public order-tracking layout. Mirrors the public checkout layout: opt out
// of the dashboard dark mode, preconnect the API host so the polling fetches
// don't pay TLS setup on the first request.
export default function PublicOrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
