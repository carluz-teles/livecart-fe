"use client"

import { use, useMemo } from "react"
import {
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useOrderStats } from "@/hooks/order"
import { formatCurrency } from "@/lib/format"
import { OrderDetailContext } from "./OrderDetailContext"

interface Insight {
  tone: "neutral" | "positive" | "warning" | "danger"
  icon: React.ComponentType<{ className?: string }>
  label: string
  hint?: string
}

const TONE: Record<Insight["tone"], string> = {
  neutral: "border-border bg-muted/30 text-foreground",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
}

const HOUR_MS = 60 * 60 * 1000
const MIN_MS = 60 * 1000

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / MIN_MS)
  if (minutes < 1) return "menos de 1 min"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMin = minutes % 60
  if (hours < 24) {
    return remainingMin > 0 ? `${hours}h ${remainingMin}min` : `${hours}h`
  }
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function OrderDetailInsights() {
  const ctx = use(OrderDetailContext)
  const { data: stats } = useOrderStats()
  const order = ctx?.state.order

  const insights = useMemo<Insight[]>(() => {
    if (!order) return []
    const now = Date.now()
    const result: Insight[] = []

    if (order.paidAt) {
      const elapsed = new Date(order.paidAt).getTime() - new Date(order.createdAt).getTime()
      result.push({
        tone: "neutral",
        icon: Clock,
        label: `Pago em ${formatDuration(elapsed)} após a live`,
      })
    }

    if (stats?.avgTicket && stats.avgTicket > 0) {
      const diff = ((order.totalAmount - stats.avgTicket) / stats.avgTicket) * 100
      const rounded = Math.round(diff)
      if (Math.abs(rounded) >= 5) {
        result.push({
          tone: rounded > 0 ? "positive" : "neutral",
          icon: rounded > 0 ? TrendingUp : TrendingDown,
          label: `${rounded > 0 ? "+" : ""}${rounded}% vs ticket médio`,
          hint: `média ${formatCurrency(stats.avgTicket)}`,
        })
      }
    }

    if (
      order.paymentStatus === "paid" &&
      order.status !== "completed" &&
      order.paidAt &&
      now - new Date(order.paidAt).getTime() > 5 * MIN_MS
    ) {
      result.push({
        tone: "danger",
        icon: AlertTriangle,
        label: "Pago, mas ERP não finalizou",
        hint: "Verifique a integração com o ERP",
      })
    }

    if (
      order.paymentStatus === "paid" &&
      order.paidAt &&
      !order.shipment &&
      now - new Date(order.paidAt).getTime() > 24 * HOUR_MS
    ) {
      result.push({
        tone: "warning",
        icon: AlertTriangle,
        label: "Pago há mais de 24h sem envio criado",
      })
    }

    if (
      order.status === "checkout" &&
      order.expiresAt &&
      new Date(order.expiresAt).getTime() - now < 24 * HOUR_MS &&
      new Date(order.expiresAt).getTime() > now
    ) {
      const remaining = new Date(order.expiresAt).getTime() - now
      result.push({
        tone: "warning",
        icon: Clock,
        label: `Expira em ${formatDuration(remaining)}`,
      })
    }

    return result
  }, [order, stats])

  if (!order || insights.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, idx) => {
          const Icon = insight.icon
          return (
            <div
              key={idx}
              className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${TONE[insight.tone]}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p className="font-medium leading-tight">{insight.label}</p>
                {insight.hint && (
                  <p className="text-xs opacity-80">{insight.hint}</p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
