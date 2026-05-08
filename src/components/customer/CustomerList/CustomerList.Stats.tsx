"use client"

import { use } from "react"
import { Sparkles, TrendingUp, Users } from "lucide-react"
import { StatsCard } from "@/components/shared/StatsCard"
import { formatCurrency } from "@/lib/format"
import { CustomerListContext } from "./CustomerListContext"

export function CustomerListStats() {
  const ctx = use(CustomerListContext)
  if (!ctx) return null
  const { stats, isStatsLoading } = ctx.state

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCard
        title="Total de clientes"
        value={stats?.totalCustomers ?? 0}
        description="Clientes únicos cadastrados"
        icon={Users}
        isLoading={isStatsLoading}
        valueClassName="text-3xl font-semibold tracking-tighter tabular-nums"
      />
      <StatsCard
        title="Ativos nos últimos 30 dias"
        value={stats?.activeCustomers ?? 0}
        description="Compraram recentemente"
        icon={Sparkles}
        isLoading={isStatsLoading}
        variant="success"
        valueClassName="text-3xl font-semibold tracking-tighter tabular-nums"
      />
      <StatsCard
        title="Gasto médio por cliente"
        value={formatCurrency(stats?.avgSpentPerCustomer ?? 0)}
        description="Valor acumulado por cliente"
        icon={TrendingUp}
        isLoading={isStatsLoading}
        valueClassName="text-3xl font-semibold tracking-tighter tabular-nums"
      />
    </div>
  )
}
