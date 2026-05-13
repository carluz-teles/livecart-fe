"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ban, ChevronLeft, ChevronRight, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useOrderNavigation } from "@/hooks/order"
import {
  FIRST_PURCHASE_BADGE,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  getStatusConfig,
} from "@/lib/constants"
import { formatDateTime } from "@/lib/format"
import { OrderDetailContext } from "./OrderDetailContext"
import { OrderDetailActions } from "./OrderDetail.Actions"

export function OrderDetailHeader() {
  const ctx = use(OrderDetailContext)
  const router = useRouter()
  const navigation = useOrderNavigation(ctx?.state.order.id ?? "")
  if (!ctx) return null
  const { order } = ctx.state

  const statusCfg = getStatusConfig(ORDER_STATUS_CONFIG, order.status, "active")
  const paymentCfg = getStatusConfig(PAYMENT_STATUS_CONFIG, order.paymentStatus, "pending")

  const handleOpenInstagramDM = () => {
    if (order.customerHandle) {
      window.open(`https://ig.me/m/${order.customerHandle}`, "_blank")
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent print:hidden"
            aria-label="Voltar para pedidos"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Operação · Pedido
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Pedido #{order.shortId}
              </h1>
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
              {order.isFirstPurchase && (
                <Badge variant={FIRST_PURCHASE_BADGE.variant}>
                  {FIRST_PURCHASE_BADGE.label}
                </Badge>
              )}
              {order.customerBlocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="destructive" className="gap-1">
                      <Ban className="h-3 w-3" />
                      Cliente bloqueado
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Esse cliente está bloqueado na loja. Pedidos antigos
                    seguem normais; novas compras dele serão ignoradas.
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {order.liveTitle && <span>{order.liveTitle} · </span>}
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {(navigation.prev || navigation.next) && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!navigation.prev}
                    onClick={() =>
                      navigation.prev &&
                      router.push(`/orders/${navigation.prev.id}`)
                    }
                    aria-label="Pedido anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {navigation.prev
                    ? `Anterior · #${navigation.prev.shortId}`
                    : "Primeiro pedido da lista"}
                </TooltipContent>
              </Tooltip>
              {navigation.total > 0 && (
                <span className="px-1 text-xs tabular-nums text-muted-foreground">
                  {navigation.position}/{navigation.total}
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!navigation.next}
                    onClick={() =>
                      navigation.next &&
                      router.push(`/orders/${navigation.next.id}`)
                    }
                    aria-label="Próximo pedido"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {navigation.next
                    ? `Próximo · #${navigation.next.shortId}`
                    : "Último pedido da lista"}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          {order.customerHandle && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenInstagramDM}
              aria-label="Abrir DM no Instagram"
            >
              <Instagram className="h-4 w-4" />
            </Button>
          )}
          <OrderDetailActions />
        </div>
      </div>
    </TooltipProvider>
  )
}
