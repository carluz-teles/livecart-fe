"use client"

import { use } from "react"
import Image from "next/image"
import { ArrowDownRight, ArrowUpRight, Minus, Package, Plus, ShoppingBag, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { useOrderUpsell } from "@/hooks/order"
import { cn } from "@/lib/utils"
import type { CartMutationType, OrderUpsellMutation } from "@/types"
import { OrderDetailContext } from "./OrderDetailContext"

const MUTATION_LABEL: Record<CartMutationType, string> = {
  item_added: "Adicionou",
  item_removed: "Removeu",
  quantity_increased: "Aumentou",
  quantity_decreased: "Diminuiu",
}

const MUTATION_TONE: Record<CartMutationType, string> = {
  item_added: "text-emerald-700",
  quantity_increased: "text-emerald-700",
  item_removed: "text-rose-700",
  quantity_decreased: "text-rose-700",
}

function MutationLine({ m }: { m: OrderUpsellMutation }) {
  const isPositive =
    m.mutationType === "item_added" || m.mutationType === "quantity_increased"
  const delta = m.quantityAfter - m.quantityBefore
  const Icon = isPositive ? Plus : Minus

  return (
    <li className="flex items-center gap-3 py-2">
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isPositive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex flex-1 items-center gap-3 min-w-0">
        {m.imageUrl ? (
          <Image
            src={m.imageUrl}
            alt={m.productName}
            width={32}
            height={32}
            className="rounded-md object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{m.productName}</p>
          <p className="text-xs text-muted-foreground">
            <span className={MUTATION_TONE[m.mutationType]}>
              {MUTATION_LABEL[m.mutationType]}
            </span>
            {" · "}
            {m.quantityBefore} → {m.quantityAfter}
            {" · "}
            {formatDateTime(m.createdAt)}
          </p>
        </div>
      </div>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          isPositive ? "text-emerald-700" : "text-rose-700"
        )}
      >
        {isPositive ? "+" : ""}
        {formatCurrency(delta * m.unitPrice)}
      </span>
    </li>
  )
}

export function OrderDetailUpsell() {
  const ctx = use(OrderDetailContext)
  const { data: upsell, isLoading } = useOrderUpsell(ctx?.state.order.id ?? "")

  if (!ctx) return null

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="h-4 w-4" />
            Mudanças no checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  const noChanges = !upsell?.hasSnapshot || (upsell?.mutations.length ?? 0) === 0

  if (noChanges) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="h-4 w-4" />
            Mudanças no checkout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pedido sem alterações no checkout.
          </p>
        </CardContent>
      </Card>
    )
  }

  const delta = upsell?.deltaCents ?? 0
  const isUpsell = delta > 0
  const isDownsell = delta < 0
  const DeltaIcon = isUpsell
    ? TrendingUp
    : isDownsell
    ? TrendingDown
    : ArrowUpRight
  const deltaTone = isUpsell
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isDownsell
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-muted text-muted-foreground"

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="h-4 w-4" />
            Mudanças no checkout
          </CardTitle>
          <Badge variant="outline" className={cn("gap-1", deltaTone)}>
            <DeltaIcon className="h-3 w-3" />
            {delta >= 0 ? "+" : ""}
            {formatCurrency(delta)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Carrinho inicial</p>
            <p className="text-base font-semibold tabular-nums">
              {formatCurrency(upsell?.initialSubtotalCents ?? 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Carrinho final</p>
            <p className="text-base font-semibold tabular-nums">
              {formatCurrency(upsell?.finalSubtotalCents ?? 0)}
              {isUpsell && <ArrowUpRight className="inline h-3.5 w-3.5 text-emerald-700 ml-1" />}
              {isDownsell && <ArrowDownRight className="inline h-3.5 w-3.5 text-rose-700 ml-1" />}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Linha do tempo ({upsell?.mutationCount} alteraç{upsell?.mutationCount === 1 ? "ão" : "ões"})
          </p>
          <ul className="divide-y">
            {(upsell?.mutations ?? []).map((m) => (
              <MutationLine key={m.id} m={m} />
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
