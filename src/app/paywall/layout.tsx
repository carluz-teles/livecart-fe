import { AppProviders } from "@/components/providers/app-providers"

export default function PaywallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppProviders>{children}</AppProviders>
}
