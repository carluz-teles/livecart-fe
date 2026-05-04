"use client"

import { use, useState } from "react"
import Image from "next/image"
import { ChevronDown, Package, ShoppingBag, TrendingDown, TrendingUp } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatTime } from "@/lib/format"
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

const POSITIVE_MUTATIONS: CartMutationType[] = [
  "item_added",
  "quantity_increased",
]

// Past this many mutations the list collapses, leaving only the header badge
// and a few preview rows visible — keeps the card compact on busy orders
// without losing the at-a-glance delta.
const VISIBLE_LIMIT = 5

function isPositiveMutation(type: CartMutationType): boolean {
  return POSITIVE_MUTATIONS.includes(type)
}

function MutationLine({ m }: { m: OrderUpsellMutation }) {
  const isPositive = isPositiveMutation(m.mutationType)
  const delta = m.quantityAfter - m.quantityBefore
  const lineTotal = delta * m.unitPrice

  return (
    <li className="flex items-center gap-3 py-2.5">
      {m.imageUrl ? (
        <Image
          src={m.imageUrl}
          alt={m.productName}
          width={36}
          height={36}
          className="shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Package className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{m.productName}</p>
        <p className="text-xs text-muted-foreground">
          {MUTATION_LABEL[m.mutationType]} · {m.quantityBefore} → {m.quantityAfter} ·{" "}
          {formatTime(m.createdAt)}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          isPositive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-destructive",
        )}
      >
        {isPositive ? "+" : ""}
        {formatCurrency(lineTotal)}
      </span>
    </li>
  )
}

interface ShellProps {
  children: React.ReactNode
}

// Single Card shell so loading/empty/loaded states all share the same chrome
// and the surrounding layout doesn't reflow as the data resolves.
function UpsellCard({ children }: ShellProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <ShoppingBag className="h-4 w-4" />
          Mudanças no checkout
        </CardTitle>
      </CardHeader>
      {children}
    </Card>
  )
}

export function OrderDetailUpsell() {
  const ctx = use(OrderDetailContext)
  const { data: upsell, isLoading } = useOrderUpsell(ctx?.state.order.id ?? "")
  const [expanded, setExpanded] = useState(false)

  if (!ctx) return null

  if (isLoading) {
    return (
      <UpsellCard>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </UpsellCard>
    )
  }

  const mutations = upsell?.mutations ?? []
  const noChanges = !upsell?.hasSnapshot || mutations.length === 0

  if (noChanges) {
    return (
      <UpsellCard>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pedido sem alterações no checkout.
          </p>
        </CardContent>
      </UpsellCard>
    )
  }

  const delta = upsell?.deltaCents ?? 0
  const isPositive = delta > 0
  const isNegative = delta < 0
  const DeltaIcon = isPositive
    ? TrendingUp
    : isNegative
      ? TrendingDown
      : null

  const overflow = mutations.length > VISIBLE_LIMIT
  const visible = overflow ? mutations.slice(0, VISIBLE_LIMIT) : mutations
  const hidden = overflow ? mutations.slice(VISIBLE_LIMIT) : []

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="h-4 w-4" />
            Mudanças no checkout
          </CardTitle>
          <Badge
            variant={isNegative ? "destructive" : "secondary"}
            className="gap-1"
          >
            {DeltaIcon ? <DeltaIcon className="h-3 w-3" /> : null}
            {delta >= 0 ? "+" : ""}
            {formatCurrency(delta)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {mutations.length}{" "}
          {mutations.length === 1 ? "alteração" : "alterações"}
        </p>
        <ul className="divide-y">
          {visible.map((m) => (
            <MutationLine key={m.id} m={m} />
          ))}
        </ul>
        {overflow && (
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleContent>
              <ul className="divide-y border-t">
                {hidden.map((m) => (
                  <MutationLine key={m.id} m={m} />
                ))}
              </ul>
            </CollapsibleContent>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-8 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                {expanded
                  ? "Mostrar menos"
                  : `Ver mais ${hidden.length} ${hidden.length === 1 ? "alteração" : "alterações"}`}
                <ChevronDown
                  className={cn(
                    "ml-1.5 h-3.5 w-3.5 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}
