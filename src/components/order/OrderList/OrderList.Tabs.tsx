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
  | "all"
  | "needs_action"
  | "awaiting_payment"
  | "to_ship"
  | "in_transit"
  | "completed"
  | "cancelled"

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

// Status sets are scoped to each tab's *primary intent*. The "needs_action"
// tab is intentionally ERP-agnostic and uses a single needsAttention flag
// on the BE that ORs every merchant-fixable failure (payment failed/refunded,
// shipment in error, ERP finalisation failed) so a problem is a problem
// regardless of which subsystem blew up.
export const ORDER_TABS: OrderTab[] = [
  {
    // Default landing tab — shows every order with no preset filter so the
    // merchant has a single clean view of their pipeline. User-applied
    // filters in the dropdown still compose freely on top.
    id: "all",
    label: "Todos",
    description:
      "Todos os pedidos, sem nenhum filtro pré-aplicado. Use a busca e os filtros para refinar.",
    filters: {},
  },
  {
    id: "needs_action",
    label: "Precisam atenção",
    description:
      "Pedidos que precisam de ação manual: pagamento falhou ou foi reembolsado, envio com problema (NFe, recusa, bloqueio, dano, não entregue) ou pedido pago que falhou ao ser enviado para o ERP. O estoque continua reservado para os casos de ERP — abra cada um para resolver.",
    filters: {
      needsAttention: true,
    },
  },
  // Every tab below excludes needs_attention rows so the triage buckets are
  // mutually exclusive — a problem cart shows up only in "Precisam atenção",
  // never doubled up in "Para despachar" because it happens to also be paid
  // without a shipment. "Todos" stays as the catch-all for full visibility.
  {
    id: "awaiting_payment",
    label: "Aguardando pagamento",
    description:
      "Cliente está no checkout ou recebeu o PIX e ainda não pagou. Sai daqui assim que o pagamento é confirmado.",
    filters: {
      status: ["active", "checkout"],
      paymentStatus: ["pending"],
      needsAttention: false,
    },
  },
  {
    id: "to_ship",
    label: "Para despachar",
    description:
      "Pedidos pagos sem envio criado e sem nenhum problema pendente. Próximo passo é gerar o envio no Melhor Envio ou SmartEnvios.",
    filters: {
      paymentStatus: ["paid"],
      hasShipment: false,
      needsAttention: false,
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
      needsAttention: false,
    },
  },
  {
    id: "completed",
    label: "Entregues",
    description: "Envios entregues ao destinatário pela transportadora.",
    filters: {
      shipmentStatus: ["delivered"],
      needsAttention: false,
    },
  },
  {
    // Estado terminal do CARRINHO — sem ação operacional do lojista, mas
    // precisa de uma janela explícita pra recuperação de carrinho abandonado e
    // pra tirar essas linhas do "Todos" quando o merchant quer triar só o
    // pipeline ativo. Filtra por status do carrinho (e não por payment_status)
    // porque é o status que marca o pedido como morto: cancelamento pelo
    // lojista, bloqueio do comprador ou fim do prazo. Uma COBRANÇA cancelada
    // pelo gateway não mata o pedido — ele segue aguardando pagamento.
    id: "cancelled",
    label: "Cancelados",
    description:
      "Pedidos cancelados pela loja (estoque já devolvido e link desativado) ou que expiraram sem pagamento. Útil para campanhas de recuperação de carrinho.",
    filters: {
      status: ["cancelled", "expired"],
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
            // The "Precisam atenção" tab is always urgent when populated:
            // every entry there means a customer is waiting on the merchant
            // to act. Render the pill in destructive tone (red) regardless
            // of active state so it's impossible to miss across any view of
            // the page.
            const isAlertTab = tab.id === "needs_action" && (count ?? 0) > 0
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
                        ? isAlertTab
                          ? "text-destructive"
                          : "text-foreground"
                        : isAlertTab
                          ? "text-destructive/80 hover:bg-destructive/5 hover:text-destructive"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <span className="tracking-tight">{tab.label}</span>
                    {!isLoading && count !== undefined && count > 0 ? (
                      <span
                        className={cn(
                          "inline-flex min-w-[1.375rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none transition-colors",
                          isAlertTab
                            ? "bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/30"
                            : isActive
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
                        "absolute inset-x-2 -bottom-px h-[3px] rounded-full transition-all duration-200",
                        isAlertTab ? "bg-destructive" : "bg-primary",
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
