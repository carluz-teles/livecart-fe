"use client"

import { use, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageCircle,
  Package,
  Truck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDateTime, formatRelativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OrderDetail } from "@/types/cart.types"
import type { ShipmentStatus } from "@/types/shipment.types"
import { OrderDetailContext } from "./OrderDetailContext"

type EventCategory = "customer" | "payment" | "logistics" | "system"
type EventKind =
  | "created"
  | "comment"
  | "paid"
  | "shipment_created"
  | "shipment_event"
  | "delivered"
  | "issue"

interface TimelineEvent {
  category: EventCategory
  kind: EventKind
  date: string
  title: string
  description?: string
}

interface FilterChip {
  id: EventCategory | "all"
  label: string
}

const FILTERS: FilterChip[] = [
  { id: "all", label: "Tudo" },
  { id: "customer", label: "Cliente" },
  { id: "payment", label: "Pagamento" },
  { id: "logistics", label: "Logística" },
  { id: "system", label: "Sistema" },
]

const ICON: Record<EventKind, React.ComponentType<{ className?: string }>> = {
  created: Activity,
  comment: MessageCircle,
  paid: CreditCard,
  shipment_created: Package,
  shipment_event: Truck,
  delivered: CheckCircle2,
  issue: AlertTriangle,
}

// Three tones only — keeps the modal aligned with the rest of the page,
// which leans on neutral muted + emerald success + destructive alert.
const TONE: Record<EventKind, string> = {
  created: "bg-muted text-muted-foreground",
  comment: "bg-muted text-muted-foreground",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  delivered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  shipment_created: "bg-muted text-muted-foreground",
  shipment_event: "bg-muted text-muted-foreground",
  issue: "bg-destructive/15 text-destructive",
}

const FIVE_MIN_MS = 5 * 60 * 1000

const SHIPMENT_ISSUE_STATUSES: ShipmentStatus[] = [
  "issue",
  "delivery_issue",
  "delivery_blocked",
  "shipment_blocked",
  "fiscal_issue",
  "damaged",
  "refused",
  "not_delivered",
]

function buildEvents(order: OrderDetail): TimelineEvent[] {
  const out: TimelineEvent[] = []

  out.push({
    category: "customer",
    kind: "created",
    date: order.createdAt,
    title: "Pedido criado",
    description: order.liveTitle
      ? `A partir da live "${order.liveTitle}"`
      : undefined,
  })

  for (const c of order.comments ?? []) {
    out.push({
      category: "customer",
      kind: "comment",
      date: c.createdAt,
      title: `@${order.customerHandle}`,
      description: c.text,
    })
  }

  if (order.paidAt) {
    out.push({
      category: "payment",
      kind: "paid",
      date: order.paidAt,
      title: "Pagamento confirmado",
      description: order.shipping
        ? `${order.shipping.serviceName} contratado`
        : undefined,
    })
  }

  // ERP stuck signal — flagged when payment confirmed >5min ago but the
  // order didn't move to completed. Surfaces in the "Sistema" filter and
  // drives the alert dot on the card.
  if (
    order.paidAt &&
    order.paymentStatus === "paid" &&
    order.status !== "completed" &&
    Date.now() - new Date(order.paidAt).getTime() > FIVE_MIN_MS
  ) {
    const stuckAt = new Date(
      new Date(order.paidAt).getTime() + FIVE_MIN_MS,
    ).toISOString()
    out.push({
      category: "system",
      kind: "issue",
      date: stuckAt,
      title: "ERP não finalizou o pedido",
      description:
        "Pagamento confirmado, mas a integração com o ERP não fechou o pedido. Verifique a configuração da integração.",
    })
  }

  if (order.shipment) {
    out.push({
      category: "logistics",
      kind: "shipment_created",
      date: order.shipment.createdAt,
      title: "Envio criado",
      description: order.shipment.trackingCode
        ? `Código ${order.shipment.trackingCode}`
        : order.shipment.provider,
    })
    for (const e of order.shipment.events ?? []) {
      const isDelivered = e.status === "delivered"
      const isIssue = SHIPMENT_ISSUE_STATUSES.includes(e.status)
      out.push({
        category: isIssue ? "system" : "logistics",
        kind: isDelivered
          ? "delivered"
          : isIssue
            ? "issue"
            : "shipment_event",
        date: e.eventAt,
        title: e.rawName || e.status,
        description: e.observation || undefined,
      })
    }
  }

  out.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return out
}

export function OrderDetailHistory() {
  const ctx = use(OrderDetailContext)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<EventCategory | "all">("all")
  const order = ctx?.state.order

  const events = useMemo(() => (order ? buildEvents(order) : []), [order])

  const counts = useMemo(() => {
    const acc: Record<EventCategory | "all", number> = {
      all: events.length,
      customer: 0,
      payment: 0,
      logistics: 0,
      system: 0,
    }
    for (const e of events) acc[e.category]++
    return acc
  }, [events])

  if (!ctx || !order) return null

  const lastEvent = events[events.length - 1]
  const hasAlert = events.some((e) => e.kind === "issue")
  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.category === filter)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Histórico
              {hasAlert && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-destructive"
                  aria-label="Há eventos de alerta"
                  role="img"
                />
              )}
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              {events.length}{" "}
              {events.length === 1 ? "evento" : "eventos"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3">
          {lastEvent ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-medium">{lastEvent.title}</span>
                {lastEvent.description ? (
                  <span className="text-muted-foreground">
                    {" · "}
                    {lastEvent.description}
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(lastEvent.date)}
              </p>
            </div>
          ) : (
            <p className="flex-1 text-sm text-muted-foreground">
              Nenhum evento registrado.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setOpen(true)}
          >
            Ver eventos
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-base">
              Histórico do pedido #{order.shortId}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Linha do tempo unificada — comentários do cliente, pagamento,
              logística e alertas do sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-1.5 border-b px-6 py-3">
            {FILTERS.map((f) => {
              const isActive = filter === f.id
              const count = counts[f.id]
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground",
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "tabular-nums",
                      isActive ? "text-primary" : "text-muted-foreground/70",
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
            {filteredEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum evento nesta categoria.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-border pl-6">
                {filteredEvents.map((entry, idx) => {
                  const Icon = ICON[entry.kind]
                  return (
                    <li key={`${entry.kind}-${idx}`} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                          TONE[entry.kind],
                        )}
                        aria-hidden
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-tight">
                          {entry.title}
                        </p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground">
                            {entry.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(entry.date)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
