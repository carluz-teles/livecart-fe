"use client"

import { use } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { OrderDetail } from "@/types/cart.types"
import {
  OrderDetailContext,
  type OrderDetailTabId,
} from "./OrderDetailContext"

interface DetailTab {
  id: OrderDetailTabId
  label: string
  description: string
}

const TABS: DetailTab[] = [
  {
    id: "summary",
    label: "Pedido",
    description:
      "Cliente, pagamento, endereço de entrega e os itens vendidos.",
  },
  {
    id: "logistics",
    label: "Logística",
    description:
      "Criação do envio, NFe, geração de etiqueta e atualizações de rastreamento.",
  },
  {
    id: "events",
    label: "Histórico",
    description:
      "Linha do tempo unificada com tudo que aconteceu com este pedido.",
  },
]

const FIVE_MIN_MS = 5 * 60 * 1000

// Each tab can flag a small dot when there is an action waiting for the
// merchant inside it. Logística surfaces the dot when the order is paid but
// has no shipment yet or is waiting for an NFe; Eventos surfaces it when the
// order is "stuck" (paid + not completed for >5min) or the shipment has an
// issue status. Other tabs never carry the dot in this PR.
function tabIndicators(order: OrderDetail): Partial<Record<OrderDetailTabId, boolean>> {
  const logisticsAction =
    order.paymentStatus === "paid" &&
    (!order.shipment || order.shipment.status === "awaiting_invoice")

  const stuck =
    order.paymentStatus === "paid" &&
    order.status !== "completed" &&
    !!order.paidAt &&
    Date.now() - new Date(order.paidAt).getTime() > FIVE_MIN_MS

  const shipmentIssue = Boolean(
    order.shipment &&
      [
        "issue",
        "delivery_issue",
        "delivery_blocked",
        "shipment_blocked",
        "fiscal_issue",
        "damaged",
        "refused",
        "not_delivered",
      ].includes(order.shipment.status),
  )

  return {
    logistics: logisticsAction,
    events: stuck || shipmentIssue,
  }
}

export function OrderDetailTabs() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order, activeTab } = ctx.state
  const { setActiveTab } = ctx.actions
  const indicators = tabIndicators(order)

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative border-b border-border print:hidden">
        <nav
          className="-mb-px flex gap-1 overflow-x-auto"
          aria-label="Seções do pedido"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const hasIndicator = !!indicators[tab.id]
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-2 whitespace-nowrap rounded-t-md px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <span className="tracking-tight">{tab.label}</span>
                    {hasIndicator ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full transition-colors",
                          isActive ? "bg-primary" : "bg-destructive",
                        )}
                        title="Ação requerida"
                      />
                    ) : null}
                    {/* Brand accent line — animated underline mirrors the
                        listing's tab pattern. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-primary transition-all duration-200",
                        isActive
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0",
                      )}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-xs text-xs leading-relaxed"
                >
                  {tab.description}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </div>
    </TooltipProvider>
  )
}
