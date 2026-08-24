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
  /** Tooltip nativo do rótulo — explica de onde o número sai. */
  hint?: string
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
  hint,
  color,
  bgColor,
  isLoading,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground" title={hint}>
              {label}
            </p>
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
      label: "Receita confirmada",
      value: formatCurrency(confirmedRevenue),
      // Projetado aparece sempre que houver carrinho aberto (projected > 0), não
      // só quando é maior que o confirmado. Ao encerrar o evento o confirmado
      // cresce e passa o projetado, mas os pedidos ainda abertos continuam sendo
      // expectativa de venda — esconder isso apagava um número que ainda vale.
      subValue: projectedRevenue > 0 ? formatCurrency(projectedRevenue) : undefined,
      subLabel: projectedRevenue > 0 ? "projetado" : undefined,
      hint: "Só pedidos efetivamente pagos. Sai da tabela de pedidos, que é a fonte da verdade do faturamento. O valor menor ao lado é a receita projetada: carrinhos abertos que ainda não foram pagos — expectativa, não faturamento.",
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      icon: TrendingUp,
      label: "Conversão",
      value: `${conversionRate}%`,
      subValue: `${paidCarts} de ${totalCarts}`,
      hint: "Carrinhos pagos sobre carrinhos criados na campanha. Como o carrinho é um só por cliente, cada pessoa conta uma vez — mesmo tendo comprado em várias transmissões.",
      subLabel: undefined,
      color: conversionRate >= 50 ? "text-green-600" : conversionRate >= 25 ? "text-amber-600" : "text-red-500",
      bgColor: conversionRate >= 50 ? "bg-green-500/10" : conversionRate >= 25 ? "bg-amber-500/10" : "bg-red-500/10",
    },
    {
      icon: Receipt,
      label: "Ticket médio",
      value: formatCurrency(averageTicket),
      subValue: "por venda",
      subLabel: undefined,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Package,
      label: "Unidades",
      hint: "Unidades efetivamente vendidas na campanha inteira, somando todas as transmissões.",
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
          hint={"hint" in metric ? (metric.hint as string | undefined) : undefined}
          color={metric.color}
          bgColor={metric.bgColor}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
