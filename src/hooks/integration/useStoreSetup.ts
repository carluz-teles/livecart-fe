"use client"

import { useIntegrations } from "./useIntegrations"

// The two integrations a store needs before it can sell: a source of orders
// (Instagram comments) and a way to charge for them (any payment gateway).
// An ERP is deliberately not here — it stays optional.
export type StoreRequirement = "instagram" | "payment"

export function useStoreSetup() {
  const { data, isLoading, isError } = useIntegrations()

  const integrations = data?.data ?? []
  const hasInstagram = integrations.some(
    (i) => i.provider === "instagram" && i.status === "active"
  )
  // Matched by type, not provider: the store can use any supported gateway.
  const hasPayment = integrations.some(
    (i) => i.type === "payment" && i.status === "active"
  )

  const missing: StoreRequirement[] = []
  if (!hasInstagram) missing.push("instagram")
  if (!hasPayment) missing.push("payment")

  return { missing, isLoading, isError }
}
