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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4" />
          Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
        {order.paidAt && (
          <p className="text-xs text-muted-foreground">
            Pago em {formatDateTime(order.paidAt)}
          </p>
        )}
        {!order.paidAt && order.expiresAt && (
          <p className="text-xs text-muted-foreground">
            Expira em {formatDateTime(order.expiresAt)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
