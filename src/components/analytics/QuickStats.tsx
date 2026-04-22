"use client"

import { ShoppingCart, Package, Radio, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface QuickStatsProps {
  openCarts: number
  projectedRevenue: number
  totalProductsSold: number
  sessionsCount: number
  isLoading?: boolean
  className?: string
}

interface StatItemProps {
  icon: React.ElementType
  label: string
  value: number | string
  subValue?: string
  color: string
  bgColor: string
  isLoading?: boolean
}

function StatItem({ icon: Icon, label, value, subValue, color, bgColor, isLoading }: StatItemProps) {
  return (
    <div className="group relative flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-muted/50">
      {/* Icon */}
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
        bgColor
      )}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-16 mt-0.5" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {subValue && (
              <span className="text-xs text-muted-foreground truncate">{subValue}</span>
            )}
          </div>
        )}
      </div>

      {/* Subtle indicator line */}
      <div className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full opacity-0 transition-opacity group-hover:opacity-100",
        bgColor.replace("/10", "")
      )} />
    </div>
  )
}

export function QuickStats({
  openCarts,
  projectedRevenue,
  totalProductsSold,
  sessionsCount,
  isLoading,
  className,
}: QuickStatsProps) {
  const stats = [
    {
      icon: ShoppingCart,
      label: "Carrinhos Abertos",
      value: openCarts,
      subValue: projectedRevenue > 0 ? formatCurrency(projectedRevenue) : undefined,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Package,
      label: "Unidades Vendidas",
      value: totalProductsSold,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Radio,
      label: "Sessoes",
      value: sessionsCount,
      subValue: sessionsCount === 1 ? "transmissao" : "transmissoes",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
  ]

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Metricas Rapidas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-center">
        <div className="space-y-1">
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              subValue={stat.subValue}
              color={stat.color}
              bgColor={stat.bgColor}
              isLoading={isLoading}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
