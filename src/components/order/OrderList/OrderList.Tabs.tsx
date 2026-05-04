"use client"

import { use } from "react"
import { useQueries } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { useStoreId } from "@/hooks/useUser"
import { orderService } from "@/services/api/order.service"
import { orderKeys } from "@/hooks/order/useOrders"
import { cn } from "@/lib/utils"
import type { OrderFilters } from "@/types/cart.types"
import { OrderListContext } from "./OrderListContext"

export type OrderTabId =
  | "needs_action"
  | "awaiting_payment"
  | "to_ship"
  | "in_transit"
  | "completed"
  | "issues"

export interface OrderTab {
  id: OrderTabId
  label: string
  // Pre-set filters for this tab. Combined with user-applied filters at the
  // Provider level (tab filters take precedence on overlapping keys).
  filters: OrderFilters
}

// Status sets are scoped to each tab's *primary intent*. Some merchant flows
// (e.g. ERP-stuck orders, expired-without-payment) span multiple buckets and
// would require backend OR-support — those are deferred to a follow-up PR.
export const ORDER_TABS: OrderTab[] = [
  {
    id: "needs_action",
    label: "Precisam ação",
    filters: {
      shipmentStatus: [
        "awaiting_invoice",
        "issue",
        "delivery_issue",
        "delivery_blocked",
        "shipment_blocked",
        "fiscal_issue",
        "damaged",
        "refused",
        "not_delivered",
      ],
    },
  },
  {
    id: "awaiting_payment",
    label: "Aguardando pagto",
    filters: {
      status: ["active", "checkout"],
      paymentStatus: ["pending"],
    },
  },
  {
    id: "to_ship",
    label: "Para despachar",
    filters: {
      paymentStatus: ["paid"],
      hasShipment: false,
    },
  },
  {
    id: "in_transit",
    label: "Em trânsito",
    filters: {
      shipmentStatus: [
        "pending",
        "pending_pickup",
        "pending_dropoff",
        "awaiting_pickup",
        "in_transit",
        "out_for_delivery",
      ],
    },
  },
  {
    id: "completed",
    label: "Concluídos",
    filters: {
      shipmentStatus: ["delivered"],
    },
  },
  {
    id: "issues",
    label: "Problemas",
    filters: {
      paymentStatus: ["failed", "refunded"],
    },
  },
]

export function getOrderTabFilters(tabId: OrderTabId): OrderFilters {
  return ORDER_TABS.find((t) => t.id === tabId)?.filters ?? {}
}

const COUNT_PARAMS_PAGINATION = { page: 1, limit: 1 } as const

export function OrderListTabs() {
  const ctx = use(OrderListContext)
  const { storeId } = useStoreId()
  const { getToken, isLoaded, isSignedIn } = useAuth()

  const enabled = isLoaded && isSignedIn && !!storeId

  const queries = useQueries({
    queries: ORDER_TABS.map((tab) => {
      const params = {
        filters: tab.filters,
        pagination: { ...COUNT_PARAMS_PAGINATION },
      }
      return {
        queryKey: orderKeys.list(storeId ?? "", params),
        queryFn: async () => {
          const token = await getToken()
          return orderService.list(storeId!, params, token)
        },
        enabled,
        staleTime: 30_000,
      }
    }),
  })

  if (!ctx) return null
  const { activeTab } = ctx.state
  const { setActiveTab } = ctx.actions

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Filtros rápidos">
        {ORDER_TABS.map((tab, index) => {
          const isActive = activeTab === tab.id
          const count = queries[index].data?.pagination.total
          const isLoading = queries[index].isLoading
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground",
              )}
            >
              <span>{tab.label}</span>
              {!isLoading && count !== undefined && count > 0 ? (
                <span
                  className={cn(
                    "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
