"use client"

import { use } from "react"
import { Facebook, Instagram, MessageCircle, Radio } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OrderDetail } from "@/types/cart.types"
import { OrderDetailContext } from "./OrderDetailContext"
import { OrderDetailCustomer } from "./OrderDetail.Customer"
import { OrderDetailItems } from "./OrderDetail.Items"
import { OrderDetailPayment } from "./OrderDetail.Payment"
import { OrderDetailShipping } from "./OrderDetail.Shipping"
import { OrderDetailUpsell } from "./OrderDetail.Upsell"

const PLATFORM_ICON: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
}

// "Pedido" tab — single landing for everything operational about the order:
// payment / customer / shipping address / origin live on the right rail, and
// the full items table (with the upsell log right below) on the left.
export function OrderDetailSummaryTab() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  return (
    // Mobile stacks the rail above the items because those cards carry the
    // highest-signal info post-live ("entrou dinheiro? quem é? pra onde vai?").
    // Desktop reverts to natural main / aside flow.
    <div className="grid gap-4 lg:grid-cols-12">
      <main className="order-2 flex flex-col gap-4 lg:col-span-8 lg:order-none">
        <OrderDetailItems />
        <OrderDetailUpsell />
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
