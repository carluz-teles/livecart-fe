"use client"

import { use } from "react"
import { Clock, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"
import { StatsCard } from "@/components/shared/StatsCard"
import { formatCurrency } from "@/lib/format"
import { OrderListContext } from "./OrderListContext"

export function OrderListStats() {
  const ctx = use(OrderListContext)
  if (!ctx) return null
  const { stats, isStatsLoading } = ctx.state

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total de Pedidos"
        value={stats?.totalOrders ?? 0}
        description="Pedidos realizados"
        icon={ShoppingCart}
        isLoading={isStatsLoading}
      />
      <StatsCard
        title="Pedidos Pendentes"
        value={stats?.pendingOrders ?? 0}
        description="Aguardando pagamento"
        icon={Clock}
        isLoading={isStatsLoading}
        variant="warning"
      />
      <StatsCard
        title="Receita Total"
        value={formatCurrency(stats?.totalRevenue ?? 0)}
        description="Valor total dos pedidos"
        icon={DollarSign}
        isLoading={isStatsLoading}
        variant="success"
      />
      <StatsCard
        title="Ticket Médio"
        value={formatCurrency(stats?.avgTicket ?? 0)}
        description="Valor médio por pedido"
        icon={TrendingUp}
        isLoading={isStatsLoading}
      />
    </div>
  )
}
