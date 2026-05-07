"use client"

import { use } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { StatsCard } from "@/components/shared/StatsCard"
import { formatCurrency } from "@/lib/format"
import type { OrderStats } from "@/types/cart.types"
import { OrderListContext } from "./OrderListContext"
import type { OrderTabId } from "./OrderList.Tabs"

type StatsVariant = "default" | "success" | "warning" | "danger" | "info"
type StatField = "totalOrders" | "totalRevenue" | "avgTicket"

interface KpiSpec {
  field: StatField
  title: string
  description: string
  icon: LucideIcon
  variant?: StatsVariant
  isCurrency?: boolean
}

// Three KPIs per tab. The set is intentionally homogeneous (count → revenue →
// avg ticket) so the merchant builds a stable mental model when switching
// tabs; only the labels and accent shift to match the tab's intent.
const TAB_KPIS: Record<OrderTabId, [KpiSpec, KpiSpec, KpiSpec]> = {
  needs_action: [
    {
      field: "totalOrders",
      title: "Pedidos com problema",
      description: "Pagamento, envio ou ERP",
      icon: AlertTriangle,
      variant: "danger",
    },
    {
      field: "totalRevenue",
      title: "Valor em risco",
      description: "Soma dos pedidos travados",
      icon: DollarSign,
      variant: "danger",
      isCurrency: true,
    },
    {
      field: "avgTicket",
      title: "Ticket médio",
      description: "Valor médio por pedido",
      icon: TrendingUp,
      isCurrency: true,
    },
  ],
  awaiting_payment: [
    {
      field: "totalOrders",
      title: "Aguardando pagamento",
      description: "PIX gerado ou em checkout",
      icon: Clock,
      variant: "warning",
    },
    {
      field: "totalRevenue",
      title: "Valor a receber",
      description: "Caso todos paguem",
      icon: DollarSign,
      isCurrency: true,
    },
    {
      field: "avgTicket",
      title: "Ticket médio",
      description: "Valor médio por pedido",
      icon: TrendingUp,
      isCurrency: true,
    },
  ],
  to_ship: [
    {
      field: "totalOrders",
      title: "Para despachar",
      description: "Pagos e sem envio criado",
      icon: Package,
    },
    {
      field: "totalRevenue",
      title: "Valor a movimentar",
      description: "Soma dos pedidos prontos",
      icon: DollarSign,
      variant: "success",
      isCurrency: true,
    },
    {
      field: "avgTicket",
      title: "Ticket médio",
      description: "Valor médio por pedido",
      icon: TrendingUp,
      isCurrency: true,
    },
  ],
  in_transit: [
    {
      field: "totalOrders",
      title: "Em trânsito",
      description: "A caminho do destinatário",
      icon: Truck,
      variant: "info",
    },
    {
      field: "totalRevenue",
      title: "Valor em trânsito",
      description: "Pedidos viajando",
      icon: DollarSign,
      isCurrency: true,
    },
    {
      field: "avgTicket",
      title: "Ticket médio",
      description: "Valor médio por pedido",
      icon: TrendingUp,
      isCurrency: true,
    },
  ],
  completed: [
    {
      field: "totalOrders",
      title: "Entregues",
      description: "Entregues ao destinatário",
      icon: CheckCircle2,
      variant: "success",
    },
    {
      field: "totalRevenue",
      title: "Receita realizada",
      description: "Soma dos pedidos entregues",
      icon: DollarSign,
      variant: "success",
      isCurrency: true,
    },
    {
      field: "avgTicket",
      title: "Ticket médio",
      description: "Valor médio por pedido",
      icon: TrendingUp,
      isCurrency: true,
    },
  ],
}

function readField(stats: OrderStats | undefined, field: StatField): number {
  if (!stats) return 0
  switch (field) {
    case "totalOrders":
      return stats.totalOrders
    case "totalRevenue":
      return stats.totalRevenue
    case "avgTicket":
      return stats.avgTicket
  }
}

function formatValue(value: number, isCurrency: boolean | undefined) {
  return isCurrency ? formatCurrency(value) : value
}

export function OrderListStats() {
  const ctx = use(OrderListContext)
  if (!ctx) return null
  const { stats, isStatsLoading, activeTab } = ctx.state
  const kpis = TAB_KPIS[activeTab] ?? TAB_KPIS.needs_action

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {kpis.map((kpi) => (
        <StatsCard
          key={`${activeTab}-${kpi.field}-${kpi.title}`}
          title={kpi.title}
          value={formatValue(readField(stats, kpi.field), kpi.isCurrency)}
          description={kpi.description}
          icon={kpi.icon}
          isLoading={isStatsLoading}
          variant={kpi.variant}
          valueClassName="text-3xl font-semibold tracking-tighter tabular-nums"
        />
      ))}
    </div>
  )
}

