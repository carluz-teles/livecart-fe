"use client"

import { Check, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/format"
import {
  BILLING_INTERVAL_DISCOUNT_PCT,
  BILLING_INTERVAL_LABELS,
  PRO_PLAN_PRICE_CENTS,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { BillingInterval } from "@/types"

const INTERVALS: BillingInterval[] = ["monthly", "semestral", "annual"]

interface PlanCardProps {
  /** Intervalo de cobrança selecionado — controlado por quem usa o componente. */
  interval: BillingInterval
  onIntervalChange: (interval: BillingInterval) => void
  /** Texto do botão de ação (varia por contexto: "Assinar", "Plano atual", etc.) */
  ctaLabel: string
  onCtaClick?: () => void
  ctaLoading?: boolean
  ctaDisabled?: boolean
  /** Destaca visualmente que este já é o plano contratado (sem seletor de intervalo interativo desabilitado). */
  isCurrent?: boolean
  /** Recursos incluídos no plano — opcional, ex.: vitrine da LP. */
  features?: string[]
  /** "light" para telas com fundo claro (dashboard, LP), "dark" para o paywall. */
  variant?: "light" | "dark"
  className?: string
}

export function PlanCard({
  interval,
  onIntervalChange,
  ctaLabel,
  onCtaClick,
  ctaLoading = false,
  ctaDisabled = false,
  isCurrent = false,
  features,
  variant = "light",
  className,
}: PlanCardProps) {
  const isDark = variant === "dark"
  const discountPct = BILLING_INTERVAL_DISCOUNT_PCT[interval]

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-2xl border p-7",
        isDark
          ? "border-white/10 bg-white/[0.04] backdrop-blur"
          : "border-border bg-card shadow-sm",
        isCurrent && (isDark ? "border-amber-400 ring-1 ring-amber-400" : "border-primary ring-1 ring-primary"),
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className={cn("text-lg font-bold", isDark && "text-white")}>Pro</h3>
        {isCurrent && (
          <Badge variant="default" className="gap-1">
            <Check className="size-3" /> Atual
          </Badge>
        )}
      </div>

      <Tabs value={interval} onValueChange={(value) => onIntervalChange(value as BillingInterval)}>
        <TabsList className={cn("grid w-full grid-cols-3", isDark && "bg-white/10")}>
          {INTERVALS.map((option) => (
            <TabsTrigger key={option} value={option} className={cn(isDark && "text-white")}>
              {BILLING_INTERVAL_LABELS[option]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-3xl font-extrabold tracking-tight", isDark && "text-white")}>
            {formatCurrency(PRO_PLAN_PRICE_CENTS[interval])}
          </span>
          <span className={cn("text-sm", isDark ? "text-neutral-400" : "text-muted-foreground")}>
            {interval === "monthly" ? "/mês" : interval === "semestral" ? "/semestre" : "/ano"}
          </span>
        </div>
        {discountPct > 0 ? (
          <p className={cn("mt-1 text-sm font-medium", isDark ? "text-amber-300" : "text-primary")}>
            Economize {discountPct}% em relação ao mensal
          </p>
        ) : (
          <p className={cn("mt-1 text-sm", isDark ? "text-neutral-400" : "text-muted-foreground")}>
            Cobrado todo mês
          </p>
        )}
      </div>

      {features && features.length > 0 && (
        <>
          <div className={cn("h-px", isDark ? "bg-white/10" : "bg-border")} />
          <div className="flex flex-col gap-2.5 text-sm">
            {features.map((feature) => (
              <span
                key={feature}
                className={cn("flex items-center gap-2", isDark && "text-neutral-300")}
              >
                <Check className={cn("size-4 shrink-0", isDark ? "text-amber-400" : "text-primary")} />
                {feature}
              </span>
            ))}
          </div>
        </>
      )}

      <Button
        className={cn(
          "mt-auto h-11 w-full",
          isDark && !isCurrent && "bg-amber-400 text-black hover:bg-amber-300"
        )}
        variant={isDark ? undefined : isCurrent ? "outline" : "default"}
        disabled={ctaDisabled || isCurrent}
        onClick={onCtaClick}
      >
        {ctaLoading ? <Loader2 className="size-4 animate-spin" /> : ctaLabel}
      </Button>
    </div>
  )
}
