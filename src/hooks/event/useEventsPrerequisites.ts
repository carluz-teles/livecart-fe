"use client"

import { useIntegrations } from "@/hooks/integration"

// What an event needs before it can exist: a source of orders (Instagram
// comments) and a way to charge for them (any active payment gateway).
export type EventPrerequisite = "instagram" | "payment"

export function useEventsPrerequisites() {
  const { data, isLoading, isError } = useIntegrations()

  const integrations = data?.data ?? []
  const hasInstagram = integrations.some(
    (i) => i.provider === "instagram" && i.status === "active"
  )
  // Matched by type, not provider: the store can use any of the supported
  // gateways, and the Events area doesn't care which one.
  const hasPayment = integrations.some(
    (i) => i.type === "payment" && i.status === "active"
  )

  const missing: EventPrerequisite[] = []
  if (!hasInstagram) missing.push("instagram")
  if (!hasPayment) missing.push("payment")

  return { missing, isLoading, isError }
}
