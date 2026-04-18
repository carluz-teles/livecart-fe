"use client"

import { ArrowRight, MessageCircle, ShoppingCart, CreditCard, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/lib/format"

interface FunnelStep {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
}

interface FunnelVisualizationProps {
  totalComments: number
  totalCarts: number
  checkoutCarts: number
  paidCarts: number
  confirmedRevenue: number
}

export function FunnelVisualization({
  totalComments,
  totalCarts,
  checkoutCarts,
  paidCarts,
  confirmedRevenue,
}: FunnelVisualizationProps) {
  const steps: FunnelStep[] = [
    {
      label: "Comentarios",
      value: totalComments,
      icon: MessageCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Carrinhos",
      value: totalCarts,
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Checkout",
      value: checkoutCarts,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Pagos",
      value: paidCarts,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
  ]

  const getConversionRate = (from: number, to: number): string => {
    if (from === 0) return "0%"
    return ((to / from) * 100).toFixed(1) + "%"
  }

  const overallConversion = getConversionRate(totalComments, paidCarts)

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Funil de Conversao</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe a jornada do comentario ate o pagamento
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(confirmedRevenue)}
          </div>
          <p className="text-sm text-muted-foreground">GMV Confirmado</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon
          const prevValue = index > 0 ? steps[index - 1].value : null
          const conversionFromPrev = prevValue !== null ? getConversionRate(prevValue, step.value) : null

          return (
            <div key={step.label} className="flex flex-1 items-center">
              {/* Step */}
              <div className="flex flex-1 flex-col items-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.bgColor}`}>
                  <Icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <span className="mt-2 text-2xl font-bold">{step.value}</span>
                <span className="text-sm text-muted-foreground">{step.label}</span>
              </div>

              {/* Arrow with conversion rate */}
              {index < steps.length - 1 && (
                <div className="flex flex-col items-center px-2">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  {conversionFromPrev !== null && index > 0 && (
                    <span className="text-xs text-muted-foreground mt-1">
                      {getConversionRate(steps[index].value, steps[index + 1].value)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall conversion bar */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Conversao geral (comentario → pagamento)</span>
          <span className="font-semibold text-green-600">{overallConversion}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all"
            style={{
              width: `${totalComments > 0 ? Math.min((paidCarts / totalComments) * 100, 100) : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
