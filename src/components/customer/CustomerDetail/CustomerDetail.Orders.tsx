"use client"

import Link from "next/link"
import { ArrowUpRight, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomerOrders } from "@/hooks/customer"
import {
  PAYMENT_STATUS_CONFIG,
  getStatusConfig,
} from "@/lib/constants"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CustomerOrder, PaymentStatus } from "@/types"

interface CustomerDetailOrdersProps {
  customerId: string
  onClose?: () => void
}

function OrderRow({ order, onClose }: { order: CustomerOrder; onClose?: () => void }) {
  const cfg = getStatusConfig(
    PAYMENT_STATUS_CONFIG,
    (order.paymentStatus ?? "pending") as PaymentStatus,
    "pending",
  )

  return (
    <Link
      href={`/orders/${order.id}`}
      onClick={onClose}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-sm transition-all",
        "hover:border-border hover:bg-muted/40 hover:shadow-sm",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Receipt className="h-4 w-4" />
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium tabular-nums">#{order.shortId}</span>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {order.createdAt ? formatDateTime(order.createdAt) : "-"} ·{" "}
            {order.totalItems} {order.totalItems === 1 ? "item" : "itens"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium tabular-nums">
          {formatCurrency(order.totalValue)}
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  )
}

export function CustomerDetailOrders({ customerId, onClose }: CustomerDetailOrdersProps) {
  const { data, isLoading, error } = useCustomerOrders(customerId)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold tracking-tight">
          Histórico de pedidos
        </h3>
        {data && data.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {data.length} {data.length === 1 ? "pedido" : "pedidos"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Não foi possível carregar os pedidos deste cliente.
        </p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
          <Receipt className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm font-medium">Nenhum pedido ainda</p>
          <p className="text-xs text-muted-foreground">
            Os pedidos deste cliente aparecerão aqui após o checkout.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((order) => (
            <OrderRow key={order.id} order={order} onClose={onClose} />
          ))}
        </div>
      )}
    </section>
  )
}
