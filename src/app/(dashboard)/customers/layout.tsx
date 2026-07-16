import { StoreSetupGate } from "@/components/shared/StoreSetupGate"

// Customers are created by people buying in a live, which needs Instagram and a
// payment method — so the area is gated on the same setup.
export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StoreSetupGate purpose="acompanhar clientes">{children}</StoreSetupGate>
}
