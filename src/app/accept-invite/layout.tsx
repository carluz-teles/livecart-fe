import { AppProviders } from "@/components/providers/app-providers"

export default function AcceptInviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppProviders>{children}</AppProviders>
}
