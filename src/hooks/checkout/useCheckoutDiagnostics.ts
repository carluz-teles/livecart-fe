"use client"

import { useEffect } from "react"
import { reportCheckoutDiagnostic } from "@/services/checkout-diagnostics.service"
import type { CheckoutDiagnosticEvent } from "@/lib/checkout-diagnostics"

export function useCheckoutDiagnostics(event: CheckoutDiagnosticEvent = "checkout_ready", attemptId?: string) {
  useEffect(() => {
    reportCheckoutDiagnostic(event)
  }, [event, attemptId])
}
