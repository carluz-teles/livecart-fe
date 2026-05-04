"use client"

import { use } from "react"
import { useQueries } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { useStoreId } from "@/hooks/useUser"
import { orderService } from "@/services/api/order.service"
import { orderKeys } from "@/hooks/order/useOrders"
import { cn } from "@/lib/utils"
import type { OrderFilters } from "@/types/cart.types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  // Plain-language explanation surfaced as a tooltip so the merchant can
  // confirm what each tab includes without opening docs.
  description: string
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
    description:
      "Envios com problema (NFe pendente, recusa, bloqueio fiscal/logístico, dano, falha na entrega). Pedidos sem envio criado ainda não aparecem aqui.",
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
    description:
      "Cliente está no checkout ou recebeu o PIX e ainda não pagou. Sai daqui assim que o pagamento é confirmado.",
    filters: {
      status: ["active", "checkout"],
      paymentStatus: ["pending"],
    },
  },
  {
    id: "to_ship",
    label: "Para despachar",
    description:
      "Pedidos pagos sem envio criado. Próximo passo é gerar o envio no Melhor Envio ou SmartEnvios.",
    filters: {
      paymentStatus: ["paid"],
      hasShipment: false,
    },
  },
  {
    id: "in_transit",
    label: "Em trânsito",
    description:
      "Envios já criados que estão coletados, em trânsito ou saíram para entrega. Sem ação imediata do lojista.",
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
    description: "Envios entregues ao destinatário pela transportadora.",
    filters: {
      shipmentStatus: ["delivered"],
    },
  },
  {
    id: "issues",
    label: "Problemas",
    description:
      "Pagamentos que falharam ou foram reembolsados. Pode ser cartão recusado, chargeback ou estorno manual.",
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
    <TooltipProvider delayDuration={200}>
      <div className="relative border-b border-border">
        <nav
          className="-mb-px flex gap-1 overflow-x-auto"
          aria-label="Filtros rápidos"
        >
          {ORDER_TABS.map((tab, index) => {
            const isActive = activeTab === tab.id
            const count = queries[index].data?.pagination.total
            const isLoading = queries[index].isLoading
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
                    {!isLoading && count !== undefined && count > 0 ? (
                      <span
                        className={cn(
                          "inline-flex min-w-[1.375rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none transition-colors",
                          isActive
                            ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30"
                            : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/15",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                    {/* Brand accent line — animated underline that signals
                        the active triage bucket without competing with the
                        page header. 3px is intentional: thicker than a
                        default border so the brand color reads. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-primary transition-all duration-200",
                        isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0",
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
