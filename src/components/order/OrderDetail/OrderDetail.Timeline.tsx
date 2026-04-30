"use client"

import { use } from "react"
import {
  Activity,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageCircle,
  Package,
  Truck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"
import { OrderDetailContext } from "./OrderDetailContext"

type TimelineKind =
  | "created"
  | "comment"
  | "paid"
  | "shipment_created"
  | "shipment_event"
  | "delivered"

interface TimelineEntry {
  kind: TimelineKind
  date: string
  title: string
  description?: string
}

const ICON: Record<TimelineKind, React.ComponentType<{ className?: string }>> = {
  created: Activity,
  comment: MessageCircle,
  paid: CreditCard,
  shipment_created: Package,
  shipment_event: Truck,
  delivered: CheckCircle2,
}

const TONE: Record<TimelineKind, string> = {
  created: "bg-muted text-muted-foreground",
  comment: "bg-muted text-muted-foreground",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  shipment_created: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  shipment_event: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
}

export function OrderDetailTimeline() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  const entries: TimelineEntry[] = []

  entries.push({
    kind: "created",
    date: order.createdAt,
    title: "Pedido criado",
    description: order.liveTitle ? `A partir da live "${order.liveTitle}"` : undefined,
  })

  for (const comment of order.comments ?? []) {
    entries.push({
      kind: "comment",
      date: comment.createdAt,
      title: `@${order.customerHandle}`,
      description: comment.text,
    })
  }

  if (order.paidAt) {
    entries.push({
      kind: "paid",
      date: order.paidAt,
      title: "Pagamento confirmado",
      description: order.shipping
        ? `${order.shipping.serviceName} contratado`
        : undefined,
    })
  }

  if (order.shipment) {
    entries.push({
      kind: "shipment_created",
      date: order.shipment.createdAt,
      title: "Envio criado",
      description: order.shipment.trackingCode
        ? `Código ${order.shipment.trackingCode}`
        : order.shipment.provider,
    })
    for (const event of order.shipment.events ?? []) {
      entries.push({
        kind: event.status === "delivered" ? "delivered" : "shipment_event",
        date: event.eventAt,
        title: event.rawName || event.status,
        description: event.observation || undefined,
      })
    }
  }

  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          Linha do tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {entries.map((entry, idx) => {
            const Icon = ICON[entry.kind]
            return (
              <li key={`${entry.kind}-${idx}`} className="relative">
                <span
                  className={`absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${TONE[entry.kind]}`}
                  aria-hidden
                >
                  <Icon className="h-3 w-3" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-tight">{entry.title}</p>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground">
                      {entry.description}
                    </p>
                  )}
                  <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {formatDateTime(entry.date)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
