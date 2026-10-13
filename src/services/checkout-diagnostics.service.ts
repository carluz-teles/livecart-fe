import type { CheckoutDiagnosticEvent } from "@/lib/checkout-diagnostics"

export function reportCheckoutDiagnostic(event: CheckoutDiagnosticEvent) {
  window.dispatchEvent(new CustomEvent("livecart:checkout", { detail: { event } }))
}
