"use client"

import { use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SalesFunnel } from "@/components/analytics/SalesFunnel"
import { EventDetailContext } from "./EventDetailContext"

export function EventDetailFunnel() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { stats, statsLoading } = ctx.state

  if (statsLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium tracking-tight">
            Funil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <SalesFunnel
      totalCarts={stats.totalCarts ?? 0}
      checkoutCarts={stats.checkoutCarts ?? 0}
      paidCarts={stats.paidCarts ?? 0}
      confirmedRevenue={stats.confirmedRevenue}
      projectedRevenue={stats.projectedRevenue}
    />
  )
}
