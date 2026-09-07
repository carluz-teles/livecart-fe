"use client"

import { QueryFeedback } from "@/components/shared/QueryFeedback"
import { use } from "react"
import { EventMetricCards } from "@/components/analytics/EventMetricCards"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailKpis() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { stats, statsLoading, statsError } = ctx.state

  return (
    <div className="flex flex-col gap-3">
      {statsError && (
        <QueryFeedback
          title="Não foi possível atualizar os indicadores do evento"
          stale={!!stats}
          retry={ctx.actions.refresh}
        />
      )}
      {(stats || statsLoading) && (
        <EventMetricCards
          confirmedRevenue={stats?.confirmedRevenue ?? 0}
          projectedRevenue={stats?.projectedRevenue ?? 0}
          paidCarts={stats?.paidCarts ?? 0}
          totalCarts={stats?.totalCarts ?? 0}
          totalProductsSold={stats?.totalProductsSold ?? 0}
          isLoading={statsLoading}
        />
      )}
    </div>
  )
}
