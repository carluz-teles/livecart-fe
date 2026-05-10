"use client"

import { use } from "react"
import { EventMetricCards } from "@/components/analytics/EventMetricCards"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailKpis() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { stats, statsLoading } = ctx.state

  return (
    <EventMetricCards
      confirmedRevenue={stats?.confirmedRevenue ?? 0}
      projectedRevenue={stats?.projectedRevenue ?? 0}
      paidCarts={stats?.paidCarts ?? 0}
      totalCarts={stats?.totalCarts ?? 0}
      totalProductsSold={stats?.totalProductsSold ?? 0}
      isLoading={statsLoading}
    />
  )
}
