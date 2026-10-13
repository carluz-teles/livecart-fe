"use client"

import type { ReactNode } from "react"
import { useCheckoutDiagnostics } from "@/hooks/checkout/useCheckoutDiagnostics"

interface Props {
  attemptId: string
  checkoutReference: string
  mode: "server" | "interactive" | "error"
  children: ReactNode
}

export function CheckoutDiagnostics({ attemptId, checkoutReference, mode, children }: Props) {
  // Also activate on client navigation and repeated SSR error screens. The
  // inline collector handles direct visits even if this component never loads.
  useCheckoutDiagnostics("checkout_loaded", attemptId)
  return (
    <div data-checkout-attempt={attemptId} data-checkout-reference={checkoutReference} data-checkout-mode={mode}>
      {children}
    </div>
  )
}
