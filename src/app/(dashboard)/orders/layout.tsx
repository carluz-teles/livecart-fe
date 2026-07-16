import { StoreSetupGate } from "@/components/shared/StoreSetupGate"

// Orders only exist once a live can capture them (Instagram) and charge for
// them (payment method), so the area is gated on the same setup.
export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StoreSetupGate purpose="receber pedidos">{children}</StoreSetupGate>
}
