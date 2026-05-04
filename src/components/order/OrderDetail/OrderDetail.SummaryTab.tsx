"use client"

import { use } from "react"
import Image from "next/image"
import { Facebook, Instagram, MessageCircle, Package, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency, formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OrderDetail } from "@/types/cart.types"
import { OrderDetailContext } from "./OrderDetailContext"
import { OrderDetailCustomer } from "./OrderDetail.Customer"
import { OrderDetailPayment } from "./OrderDetail.Payment"
import { OrderDetailShipping } from "./OrderDetail.Shipping"

const PREVIEW_LIMIT = 5

const PLATFORM_ICON: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
}

export function OrderDetailSummaryTab() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state
  const { setActiveTab } = ctx.actions

  return (
    // Mobile: sidebar (Pagamento/Cliente/Entrega/Live) sobe pro topo because
    // those cards carry the highest-signal info post-live ("entrou dinheiro?
    // quem é? pra onde vai?"). Desktop reverts to natural left-main / right-
    // aside flow.
    <div className="grid gap-4 lg:grid-cols-12">
      <main className="order-2 flex flex-col gap-4 lg:col-span-8 lg:order-none">
        <SummaryItemsPreview
          order={order}
          onSeeAll={() => setActiveTab("items")}
        />
      </main>
      <aside className="order-1 flex flex-col gap-4 lg:col-span-4 lg:order-none">
        <OrderDetailPayment />
        <OrderDetailCustomer />
        <OrderDetailShipping />
        <SummaryLiveCard order={order} />
      </aside>
    </div>
  )
}

interface ItemsPreviewProps {
  order: OrderDetail
  onSeeAll: () => void
}

function SummaryItemsPreview({ order, onSeeAll }: ItemsPreviewProps) {
  const visible = order.items.slice(0, PREVIEW_LIMIT)
  const remaining = Math.max(0, order.items.length - PREVIEW_LIMIT)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Package className="h-4 w-4" />
          Itens ({order.totalItems})
        </CardTitle>
        {order.items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onSeeAll}
          >
            Ver todos →
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {order.items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Pedido sem itens.
          </p>
        ) : (
          <ul className="divide-y">
            {visible.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.size ? `${item.size} · ` : ""}
                    <span className="font-mono">{item.keyword}</span>
                    {" · ×"}
                    {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {formatCurrency(item.totalPrice)}
                </span>
              </li>
            ))}
            {remaining > 0 && (
              <li className="flex items-center justify-between py-3">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  +{remaining} {remaining === 1 ? "item" : "itens"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={onSeeAll}
                >
                  Ver todos →
                </Button>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

interface LiveCardProps {
  order: OrderDetail
}

function SummaryLiveCard({ order }: LiveCardProps) {
  const PlatformIcon = PLATFORM_ICON[order.livePlatform] ?? null
  const platformLabel =
    order.livePlatform.charAt(0).toUpperCase() + order.livePlatform.slice(1)
  const comments = order.comments ?? []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Radio className="h-4 w-4" />
          Live de origem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium leading-tight">
            {order.liveTitle || "Sem título"}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {PlatformIcon && (
              <PlatformIcon className="h-3 w-3" aria-hidden="true" />
            )}
            {platformLabel}
          </p>
        </div>

        {comments.length > 0 && (
          <div className={cn("space-y-2 border-t pt-3")}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              Comentários do cliente ({comments.length})
            </p>
            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-md bg-muted/40 px-2.5 py-1.5"
                >
                  <p className="text-sm leading-snug">{c.text}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {formatTime(c.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
