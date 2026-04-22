"use client"

import { DollarSign, TrendingUp, Receipt, Package } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface EventMetricCardsProps {
  confirmedRevenue: number
  projectedRevenue: number
  paidCarts: number
  totalCarts: number
  totalProductsSold: number
  isLoading?: boolean
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  subLabel?: string
  color: string
  bgColor: string
  isLoading?: boolean
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  subLabel,
  color,
  bgColor,
  isLoading,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className={cn("text-2xl font-bold tracking-tight", color)}>
                  {value}
                </p>
                {subValue && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{subValue}</span>
                    {subLabel && <span className="ml-1">{subLabel}</span>}
                  </p>
                )}
              </>
            )}
          </div>
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            bgColor
          )}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EventMetricCards({
  confirmedRevenue,
  projectedRevenue,
  paidCarts,
  totalCarts,
  totalProductsSold,
  isLoading,
}: EventMetricCardsProps) {
  // Calculate derived metrics
  const conversionRate = totalCarts > 0 ? Math.round((paidCarts / totalCarts) * 100) : 0
  const averageTicket = paidCarts > 0 ? Math.round(confirmedRevenue / paidCarts) : 0

  const metrics = [
    {
      icon: DollarSign,
      label: "Faturamento",
      value: formatCurrency(confirmedRevenue),
      subValue: projectedRevenue > confirmedRevenue ? formatCurrency(projectedRevenue) : undefined,
      subLabel: projectedRevenue > confirmedRevenue ? "projetado" : undefined,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      icon: TrendingUp,
      label: "Conversao",
      value: `${conversionRate}%`,
      subValue: `${paidCarts} de ${totalCarts}`,
      subLabel: undefined,
      color: conversionRate >= 50 ? "text-green-600" : conversionRate >= 25 ? "text-amber-600" : "text-red-500",
      bgColor: conversionRate >= 50 ? "bg-green-500/10" : conversionRate >= 25 ? "bg-amber-500/10" : "bg-red-500/10",
    },
    {
      icon: Receipt,
      label: "Ticket Medio",
      value: formatCurrency(averageTicket),
      subValue: "por venda",
      subLabel: undefined,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Package,
      label: "Unidades",
      value: totalProductsSold,
      subValue: "vendidas",
      subLabel: undefined,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          subValue={metric.subValue}
          subLabel={metric.subLabel}
          color={metric.color}
          bgColor={metric.bgColor}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
