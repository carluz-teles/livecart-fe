import { StoreSetupGate } from "@/components/shared/StoreSetupGate"

// Events only work with a connected Instagram account (where orders come from)
// and an active payment method (how they get charged). Gated in the layout so
// the rule is declared once for the segment instead of per page.
export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StoreSetupGate purpose="criar eventos">{children}</StoreSetupGate>
}
