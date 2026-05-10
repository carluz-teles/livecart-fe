"use client"

import { use } from "react"
import { TopProducts } from "@/components/analytics/TopProducts"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailTopProducts({ limit = 5 }: { limit?: number }) {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { products, productsLoading } = ctx.state

  return (
    <TopProducts products={products} isLoading={productsLoading} limit={limit} />
  )
}
