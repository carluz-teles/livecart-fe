"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent print:hidden"
          aria-label="Voltar para pedidos"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
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
          </div>
          <p className="text-sm text-muted-foreground">
            {order.liveTitle && <span>{order.liveTitle} · </span>}
            {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 print:hidden">
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
  )
}
