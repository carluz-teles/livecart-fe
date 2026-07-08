"use client"

import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Radio,
  TimerOff,
  Undo2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { DashboardOverview } from "@/types/dashboard.types"

interface FunnelStatesProps {
  data?: DashboardOverview
  isLoading?: boolean
}

// Funil do período com ESTADOS (redesign jul/2026): além da conversão
// comentário → pago, mostra as saídas — expirados (dinheiro em risco),
// recuperados pelo WhatsApp e estornos. Percentuais são step-to-step.
export function FunnelStates({ data, isLoading }: FunnelStatesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    )
  }

  const empty = !data || (data.totalCarts === 0 && data.totalComments === 0)

  const steps = data
    ? [
        { label: "Comentários", value: data.totalComments },
        { label: "Carrinhos", value: data.totalCarts },
        { label: "Checkout", value: data.checkoutCarts },
        { label: "Pagos", value: data.paidCarts },
      ]
    : []

  const stepPct = (i: number) => {
    if (!data || i === 0) return null
    const prev = steps[i - 1].value
    if (prev === 0) return null
    return Math.round((steps[i].value / prev) * 100)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Funil do período</CardTitle>
            <CardDescription>
              {data && data.lives > 0
                ? `${data.lives} ${data.lives === 1 ? "live" : "lives"} no período`
                : "Da live ao pagamento"}
            </CardDescription>
          </div>
          <Link
            href="/events"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ver por evento →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {empty ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Radio className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">Sem atividade no período</p>
            <p className="text-xs text-muted-foreground">
              Os números do funil aparecem depois da sua próxima live.
            </p>
          </div>
        ) : (
          <>
            {/* Etapas */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
              {steps.map((step, i) => {
                const pct = stepPct(i)
                return (
                  <div key={step.label} className="flex flex-1 items-center">
                    {i > 0 && (
                      <div className="hidden flex-col items-center px-2 sm:flex">
                        <ArrowRight className="size-4 text-muted-foreground/60" />
                        {pct !== null && (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {pct}%
                          </span>
                        )}
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex-1 rounded-lg border p-3",
                        i === steps.length - 1
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "bg-muted/30"
                      )}
                    >
                      <p className="text-xs text-muted-foreground">{step.label}</p>
                      <p
                        className={cn(
                          "text-xl font-bold",
                          i === steps.length - 1 && "text-emerald-700"
                        )}
                      >
                        {step.value.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Estados de saída */}
            {data && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-3">
                {data.expiredCarts > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TimerOff className="size-3.5 text-amber-600" />
                    <strong className="text-foreground">{data.expiredCarts}</strong>
                    expirados
                    {data.expiredValueCents > 0 && (
                      <span className="text-amber-700">
                        ({formatCurrency(data.expiredValueCents)} em risco)
                      </span>
                    )}
                  </span>
                )}
                {data.recoveredCarts > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MessageCircle className="size-3.5 text-emerald-600" />
                    <strong className="text-foreground">{data.recoveredCarts}</strong>
                    recuperados pelo WhatsApp
                    <span className="text-emerald-700">
                      (+{formatCurrency(data.recoveredRevenueCents)})
                    </span>
                  </span>
                )}
                {data.refundedCarts > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Undo2 className="size-3.5 text-red-500" />
                    <strong className="text-foreground">{data.refundedCarts}</strong>
                    estornados
                  </span>
                )}
                {data.expiredCarts === 0 && data.recoveredCarts === 0 && data.refundedCarts === 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <AlertTriangle className="size-3.5 opacity-50" />
                    Sem perdas registradas no período 🎉
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
