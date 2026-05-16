"use client"

import { CalendarClock, ShoppingBag, Sparkles, Wallet } from "lucide-react"
import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import type { Customer } from "@/types/customer.types"

interface CustomerDetailStatsProps {
  customer: Customer | undefined
  isLoading: boolean
}

interface StatProps {
  label: string
  value: React.ReactNode
  hint?: string
  icon: typeof ShoppingBag
  isLoading?: boolean
  accent?: "default" | "money" | "live"
}

function Stat({ label, value, hint, icon: Icon, isLoading, accent = "default" }: StatProps) {
  const accentClass =
    accent === "money"
      ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
      : accent === "live"
        ? "bg-primary/10 text-primary ring-primary/20"
        : "bg-muted/60 text-muted-foreground ring-border/60"

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20">
      {/* Hover glow */}
      <div
        aria-hidden
        className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity group-hover:from-primary/[0.04] group-hover:to-primary/[0.02] group-hover:opacity-100"
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md ring-1",
              accentClass,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="mt-2.5 text-lg font-semibold tabular-nums leading-none">
          {isLoading ? <Skeleton className="h-5 w-20" /> : value}
        </div>
        {hint && !isLoading && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  )
}

export function CustomerDetailStats({ customer, isLoading }: CustomerDetailStatsProps) {
  const total = customer?.totalOrders ?? 0
  const spent = customer?.totalSpent ?? 0
  const aov = total > 0 ? Math.round(spent / total) : 0

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      <Stat
        label="Pedidos"
        value={total}
        icon={ShoppingBag}
        isLoading={isLoading}
      />
      <Stat
        label="Total gasto"
        value={formatCurrency(spent)}
        icon={Wallet}
        accent="money"
        isLoading={isLoading}
      />
      <Stat
        label="Ticket médio"
        value={aov > 0 ? formatCompactCurrency(aov) : "—"}
        icon={Sparkles}
        accent="live"
        isLoading={isLoading}
        hint={aov > 0 ? "por pedido" : "sem pedidos"}
      />
      <Stat
        label="Última compra"
        value={
          <span className="text-sm font-medium">
            {formatDate(customer?.lastOrderAt ?? null)}
          </span>
        }
        icon={CalendarClock}
        isLoading={isLoading}
      />
    </div>
  )
}
