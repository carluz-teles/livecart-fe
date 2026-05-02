"use client"

import Image from "next/image"
import { ArrowDownRight, ArrowUpRight, Package, ShoppingBag, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/format"
import { useEventCheckoutUpsell } from "@/hooks/event"
import { cn } from "@/lib/utils"
import type { CheckoutUpsellProduct } from "@/types"

interface EventCheckoutUpsellProps {
  /** Optional event scope. Omit for store-wide aggregated metric. */
  eventId?: string
}

function MetricCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string
  value: string
  tone: "neutral" | "positive" | "negative"
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <Icon
              className={cn(
                "h-4 w-4",
                tone === "positive" && "text-emerald-700",
                tone === "negative" && "text-rose-700",
                tone === "neutral" && "text-muted-foreground"
              )}
            />
          )}
        </div>
        <p
          className={cn(
            "mt-1 text-2xl font-semibold tracking-tight tabular-nums",
            tone === "positive" && "text-emerald-700",
            tone === "negative" && "text-rose-700"
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function TopProductsList({
  title,
  rows,
  tone,
}: {
  title: string
  rows: CheckoutUpsellProduct[]
  tone: "positive" | "negative"
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((p) => (
              <li key={p.productId} className="flex items-center gap-3 py-2">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.productName}
                    width={32}
                    height={32}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{p.productName}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {p.units} {p.units === 1 ? "unidade" : "unidades"}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    tone === "positive" ? "text-emerald-700" : "text-rose-700"
                  )}
                >
                  {tone === "positive" ? "+" : "−"}
                  {formatCurrency(p.revenueCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function EventCheckoutUpsell({ eventId }: EventCheckoutUpsellProps) {
  const { data, isLoading } = useEventCheckoutUpsell(eventId)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  const upsell = data?.upsellCents ?? 0
  const downsell = data?.downsellCents ?? 0
  const net = data?.netCents ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">
          Upsell no checkout
        </h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Upsell"
          value={`+${formatCurrency(upsell)}`}
          tone="positive"
          icon={TrendingUp}
        />
        <MetricCard
          label="Downsell"
          value={`−${formatCurrency(downsell)}`}
          tone="negative"
          icon={TrendingDown}
        />
        <MetricCard
          label="Líquido"
          value={`${net >= 0 ? "+" : ""}${formatCurrency(net)}`}
          tone={net > 0 ? "positive" : net < 0 ? "negative" : "neutral"}
          icon={net >= 0 ? ArrowUpRight : ArrowDownRight}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TopProductsList
          title="Mais adicionados no checkout"
          rows={data?.topAdded ?? []}
          tone="positive"
        />
        <TopProductsList
          title="Mais removidos no checkout"
          rows={data?.topRemoved ?? []}
          tone="negative"
        />
      </div>
      {data && data.totalPaidCarts > 0 && (
        <p className="text-xs text-muted-foreground">
          {data.cartsWithMutations} de {data.totalPaidCarts} carrinhos pagos
          tiveram alterações no checkout.
        </p>
      )}
    </div>
  )
}
