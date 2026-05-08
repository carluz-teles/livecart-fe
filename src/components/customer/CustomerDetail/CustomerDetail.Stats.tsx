"use client"

import { CalendarClock, ShoppingBag, Wallet } from "lucide-react"
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
  icon: typeof ShoppingBag
  isLoading?: boolean
  accent?: string
}

function Stat({ label, value, icon: Icon, isLoading, accent }: StatProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md bg-muted",
            accent,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-2 text-xl font-semibold tabular-nums">
        {isLoading ? <Skeleton className="h-6 w-20" /> : value}
      </div>
    </div>
  )
}

export function CustomerDetailStats({ customer, isLoading }: CustomerDetailStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat
        label="Pedidos"
        value={customer?.totalOrders ?? 0}
        icon={ShoppingBag}
        isLoading={isLoading}
      />
      <Stat
        label="Total gasto"
        value={formatCurrency(customer?.totalSpent ?? 0)}
        icon={Wallet}
        isLoading={isLoading}
        accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
      />
      <Stat
        label="Última compra"
        value={
          <span className="text-base font-medium">
            {formatDate(customer?.lastOrderAt ?? null)}
          </span>
        }
        icon={CalendarClock}
        isLoading={isLoading}
      />
    </div>
  )
}
