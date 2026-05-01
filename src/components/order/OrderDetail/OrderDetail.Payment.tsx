"use client"

import { use } from "react"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PAYMENT_STATUS_CONFIG,
  getStatusConfig,
} from "@/lib/constants"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { OrderDetailContext } from "./OrderDetailContext"

export function OrderDetailPayment() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  const paymentCfg = getStatusConfig(
    PAYMENT_STATUS_CONFIG,
    order.paymentStatus,
    "pending",
  )

  const shippingCents = order.shipping?.costCents ?? 0
  const itemsTotal = order.totalAmount - shippingCents
  const discountCents = 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4" />
          Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
          {order.paidAt ? (
            <p className="text-xs text-muted-foreground">
              Pago em {formatDateTime(order.paidAt)}
            </p>
          ) : order.expiresAt ? (
            <p className="text-xs text-muted-foreground">
              Expira em {formatDateTime(order.expiresAt)}
            </p>
          ) : null}
        </div>

        <dl className="space-y-1.5 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">Valor pago</dt>
            <dd className="tabular-nums">{formatCurrency(itemsTotal)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">Frete</dt>
            <dd className="tabular-nums">
              {order.shipping
                ? order.shipping.freeShipping
                  ? "Grátis"
                  : formatCurrency(shippingCents)
                : "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">Desconto</dt>
            <dd className="tabular-nums">
              {discountCents > 0 ? `-${formatCurrency(discountCents)}` : "—"}
            </dd>
          </div>
          <div className="mt-2 flex items-baseline justify-between border-t pt-2 text-base font-semibold">
            <dt>Valor total</dt>
            <dd className="tabular-nums">{formatCurrency(order.totalAmount)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
