"use client"

import { CalendarClock, ShoppingBag, Sparkles, Wallet } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/format"
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
      <div
        aria-hidden
        className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity group-hover:from-primary/[0.04] group-hover:to-primary/[0.02] group-hover:opacity-100"
      />
      <div className="relative flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1",
              accentClass,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="flex min-h-[1.75rem] items-baseline gap-1.5">
          {isLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <span className="text-xl font-semibold leading-none tabular-nums">
              {value}
            </span>
          )}
        </div>
        {hint && !isLoading && (
          <p className="text-[11px] leading-none text-muted-foreground">{hint}</p>
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
    // Drawer is narrow (sm:max-w-xl ≈ 576px). Forcing 2 cols keeps room for
    // full currency strings like "R$ 36.344,50" without truncation.
    <div className="grid grid-cols-2 gap-2.5">
      <Stat
        label="Pedidos"
        value={total}
        icon={ShoppingBag}
        isLoading={isLoading}
        hint={total === 0 ? "sem compras" : total === 1 ? "1 pedido" : `${total} pedidos`}
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
        value={aov > 0 ? formatCurrency(aov) : "—"}
        icon={Sparkles}
        accent="live"
        isLoading={isLoading}
        hint={aov > 0 ? "por pedido" : "sem histórico"}
      />
      <Stat
        label="Última compra"
        value={formatDate(customer?.lastOrderAt ?? null)}
        icon={CalendarClock}
        isLoading={isLoading}
      />
    </div>
  )
}
