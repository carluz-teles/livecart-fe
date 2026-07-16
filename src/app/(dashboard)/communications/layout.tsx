import { StoreSetupGate } from "@/components/shared/StoreSetupGate"

// Communications are the automatic Instagram messages sent around a checkout,
// so they need both the Instagram account and a payment method to be useful.
export default function CommunicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StoreSetupGate purpose="enviar comunicações">{children}</StoreSetupGate>
}
