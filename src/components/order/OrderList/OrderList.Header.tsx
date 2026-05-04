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
      {/* Eyebrow microheading — UPPERCASE letterspaced is the product's
          quiet "we operate this with intent" voice. Reused on detail. */}
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Operação
      </span>
      <div className="flex items-baseline gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Pedidos</h1>
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
