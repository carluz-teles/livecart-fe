"use client"

import { use } from "react"
import { OrderListContext } from "./OrderListContext"
import { ORDER_TABS } from "./OrderList.Tabs"

export function OrderListHeader() {
  const ctx = use(OrderListContext)
  if (!ctx) return null
  const { total, activeTab, isLoading } = ctx.state
  const activeTabLabel =
    ORDER_TABS.find((t) => t.id === activeTab)?.label.toLowerCase() ?? ""

  return (
    <header className="flex flex-col gap-1.5">
      {/* Eyebrow microheading — letterspacing is intentional and not part of
          the standard Tailwind scale; treated as a deliberate design choice
          for the operational dashboard voice. Used on detail too. */}
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Operação
      </span>
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <span
          className="text-sm tabular-nums text-muted-foreground"
          aria-live="polite"
        >
          {isLoading ? "—" : total}{" "}
          {total === 1 ? "pedido" : "pedidos"} · {activeTabLabel}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Acompanhe e gerencie os pedidos das suas lives.
      </p>
    </header>
  )
}
