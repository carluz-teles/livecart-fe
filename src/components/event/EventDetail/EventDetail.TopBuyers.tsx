"use client"

import { use } from "react"
import { TopBuyers } from "@/components/analytics/TopBuyers"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailTopBuyers({ limit = 5 }: { limit?: number }) {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { carts, cartsLoading } = ctx.state

  return <TopBuyers carts={carts} isLoading={cartsLoading} limit={limit} />
}
