"use client"

import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SalesFunnelProps {
  /** Kept for API parity but no longer rendered — comments don't belong in
   *  the conversion timeline (they're not a discrete step). */
  totalComments?: number
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
  percent: number
}

// Minimalist conversion timeline. One dot per step, connecting line between
// dots, label on the left, absolute count and percentage on the right.
// All percentages reference the entry of the funnel (totalCarts) so the
// drop-off between steps reads in absolute terms — easier mental math for
// the merchant scanning post-live.
export function SalesFunnel({
  totalCarts,
  checkoutCarts,
  paidCarts,
  confirmedRevenue,
  projectedRevenue = 0,
  className,
}: SalesFunnelProps) {
  const pct = (value: number) => {
    if (totalCarts === 0) return 0
    return Math.round((value / totalCarts) * 100)
  }

  const steps: FunnelStep[] = [
    { label: "Carrinhos", value: totalCarts, percent: 100 },
    { label: "Checkout", value: checkoutCarts, percent: pct(checkoutCarts) },
    { label: "Pagos", value: paidCarts, percent: pct(paidCarts) },
  ]

  const hasRevenue = confirmedRevenue > 0 || projectedRevenue > 0

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium tracking-tight">
          Funil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1
            const isActive = step.value > 0
            return (
              <li
                key={step.label}
                className="relative flex items-center gap-4 pb-5 last:pb-0"
              >
                {/* Vertical connector — sits between this dot and the next. */}
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute left-[7px] top-4 h-full w-px bg-border"
                  />
                )}
                {/* Dot */}
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-card transition-colors",
                    isActive
                      ? idx === steps.length - 1
                        ? "bg-emerald-500"
                        : "bg-foreground"
                      : "bg-muted",
                  )}
                />
                {/* Label + numbers */}
                <div className="flex flex-1 items-baseline justify-between gap-3">
                  <span
                    className={cn(
                      "text-sm font-medium tracking-tight",
                      !isActive && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  <div className="flex items-baseline gap-4 tabular-nums">
                    <span className="text-sm text-muted-foreground">
                      {step.value}
                    </span>
                    <span
                      className={cn(
                        "min-w-[3rem] text-right text-sm font-semibold",
                        !isActive && "text-muted-foreground",
                      )}
                    >
                      {step.percent}%
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        {hasRevenue && (
          <div className="mt-4 space-y-1.5 border-t pt-3 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Confirmado</span>
              <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatCurrency(confirmedRevenue)}
              </span>
            </div>
            {projectedRevenue > confirmedRevenue && (
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Projetado</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(projectedRevenue)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
