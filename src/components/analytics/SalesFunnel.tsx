"use client"

import { ShoppingCart, CreditCard, CheckCircle, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SalesFunnelProps {
  totalComments?: number // Kept for backward compatibility but not displayed
  totalCarts: number
  checkoutCarts: number
  paidCarts: number
  confirmedRevenue: number
  projectedRevenue?: number
  className?: string
}

interface FunnelStep {
  label: string
  value: number
  percentage: number
  icon: React.ElementType
  color: string
  bgColor: string
}

export function SalesFunnel({
  totalCarts,
  checkoutCarts,
  paidCarts,
  confirmedRevenue,
  projectedRevenue = 0,
  className,
}: SalesFunnelProps) {
  // Calculate percentages based on the previous step (funnel logic)
  const getPercentage = (current: number, base: number): number => {
    if (base === 0) return 0
    return Math.round((current / base) * 100)
  }

  // All percentages relative to totalCarts (real funnel)
  const steps: FunnelStep[] = [
    {
      label: "Carrinhos",
      value: totalCarts,
      percentage: 100,
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-500",
    },
    {
      label: "Checkout",
      value: checkoutCarts,
      percentage: getPercentage(checkoutCarts, totalCarts),
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-500",
    },
    {
      label: "Pagos",
      value: paidCarts,
      percentage: getPercentage(paidCarts, totalCarts),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-500",
    },
  ]

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Funil de Vendas</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600">{formatCurrency(confirmedRevenue)}</span>
              <span className="text-muted-foreground">confirmado</span>
            </div>
            {projectedRevenue > confirmedRevenue && (
              <div className="text-muted-foreground">
                <span className="font-medium">{formatCurrency(projectedRevenue)}</span>
                <span className="ml-1">projetado</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-center">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isFirst = index === 0

            return (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      step.value > 0 ? step.bgColor + "/10" : "bg-muted"
                    )}>
                      <Icon className={cn("h-4 w-4", step.value > 0 ? step.color : "text-muted-foreground")} />
                    </div>
                    <span className="font-medium">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {step.value}
                    </span>
                    {!isFirst && (
                      <span className={cn(
                        "text-lg font-bold tabular-nums min-w-[4rem] text-right",
                        step.percentage >= 50 ? "text-green-600" :
                        step.percentage >= 25 ? "text-amber-600" :
                        step.percentage > 0 ? "text-red-500" : "text-muted-foreground"
                      )}>
                        {step.percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", step.bgColor)}
                    style={{
                      width: `${isFirst ? 100 : step.percentage}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
