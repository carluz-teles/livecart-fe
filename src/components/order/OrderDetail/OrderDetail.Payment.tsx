"use client"

import { use } from "react"
import { AlertCircle, CreditCard, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PAYMENT_STATUS_CONFIG,
  getStatusConfig,
} from "@/lib/constants"
import {
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/format"
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

  // Treat the order as expired when the cart-side status flips to expired
  // OR the payment is still pending past the expiresAt timestamp (catches
  // the brief window before the backend job marks the cart). Paid orders
  // never expire from the merchant's perspective.
  const isExpired =
    order.paymentStatus !== "paid" &&
    (order.status === "expired" ||
      (!!order.expiresAt && new Date(order.expiresAt).getTime() < Date.now()))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4" />
          Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
          {order.paidAt ? (
            <p className="text-xs text-muted-foreground">
              Pago em {formatDateTime(order.paidAt)}
            </p>
          ) : !isExpired && order.expiresAt ? (
            <p className="text-xs text-muted-foreground">
              Expira em {formatDateTime(order.expiresAt)}
            </p>
          ) : null}
        </div>

        {isExpired && (
          <ExpiredAlert
            expiresAt={order.expiresAt}
            onReopen={ctx.actions.requestRegenerate}
          />
        )}

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

interface ExpiredAlertProps {
  expiresAt: string | null
  onReopen: () => void
}

function ExpiredAlert({ expiresAt, onReopen }: ExpiredAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 print:hidden"
    >
      <div className="flex items-start gap-2">
        <AlertCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-destructive">
            Pedido expirou
          </p>
          {expiresAt && (
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(expiresAt)} · {formatDateTime(expiresAt)}
            </p>
          )}
        </div>
      </div>
      <Button size="sm" onClick={onReopen} className="w-full">
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Reabrir checkout
      </Button>
    </div>
  )
}
