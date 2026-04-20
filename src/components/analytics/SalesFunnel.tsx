"use client"

import { MessageCircle, ShoppingCart, CreditCard, CheckCircle, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SalesFunnelProps {
  totalComments: number
  totalCarts: number
  checkoutCarts: number
  paidCarts: number
  confirmedRevenue: number
  projectedRevenue?: number
  className?: string
}

interface FunnelStep {
  label: string
  sublabel: string
  value: number
  percentage: number
  icon: React.ElementType
  color: string
  barColor: string
}

export function SalesFunnel({
  totalComments,
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

  const steps: FunnelStep[] = [
    {
      label: "Comentarios",
      sublabel: "detectados",
      value: totalComments,
      percentage: 100, // Base - always 100%
      icon: MessageCircle,
      color: "text-blue-600",
      barColor: "bg-blue-500",
    },
    {
      label: "Carrinhos",
      sublabel: "criados",
      value: totalCarts,
      percentage: getPercentage(totalCarts, totalComments),
      icon: ShoppingCart,
      color: "text-amber-600",
      barColor: "bg-amber-500",
    },
    {
      label: "Checkout",
      sublabel: "iniciaram",
      value: checkoutCarts,
      percentage: getPercentage(checkoutCarts, totalCarts),
      icon: CreditCard,
      color: "text-purple-600",
      barColor: "bg-purple-500",
    },
    {
      label: "Pagos",
      sublabel: "confirmados",
      value: paidCarts,
      percentage: getPercentage(paidCarts, checkoutCarts),
      icon: CheckCircle,
      color: "text-green-600",
      barColor: "bg-green-500",
    },
  ]

  const overallConversion = getPercentage(paidCarts, totalComments)

  return (
    <Card className={className}>
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
      <CardContent className="pt-0">
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isFirst = index === 0
            const prevStep = index > 0 ? steps[index - 1] : null
            const dropFromPrev = prevStep ? prevStep.value - step.value : 0

            return (
              <div key={step.label} className="group">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    step.value > 0 ? step.barColor + "/10" : "bg-muted"
                  )}>
                    <Icon className={cn("h-4 w-4", step.value > 0 ? step.color : "text-muted-foreground")} />
                  </div>

                  {/* Label and stats */}
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium">{step.label}</span>
                      <span className="text-xs text-muted-foreground">{step.sublabel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Drop indicator */}
                      {!isFirst && dropFromPrev > 0 && (
                        <span className="text-xs text-muted-foreground">
                          -{dropFromPrev}
                        </span>
                      )}
                      {/* Value */}
                      <span className={cn(
                        "text-lg font-semibold tabular-nums",
                        step.value > 0 ? step.color : "text-muted-foreground"
                      )}>
                        {step.value}
                      </span>
                      {/* Percentage badge */}
                      {!isFirst && (
                        <span className={cn(
                          "min-w-[3rem] text-right text-sm font-medium",
                          step.percentage >= 50 ? "text-green-600" :
                          step.percentage >= 25 ? "text-amber-600" :
                          step.percentage > 0 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {step.percentage}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="ml-11 mt-1.5">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", step.barColor)}
                      style={{
                        width: `${isFirst ? 100 : step.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Overall conversion footer */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Conversao total (comentario → pagamento)
          </span>
          <span className={cn(
            "text-sm font-semibold",
            overallConversion >= 10 ? "text-green-600" :
            overallConversion >= 5 ? "text-amber-600" :
            overallConversion > 0 ? "text-red-500" : "text-muted-foreground"
          )}>
            {overallConversion}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
