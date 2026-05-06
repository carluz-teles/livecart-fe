"use client"

import { Check, Clock, Package, Truck, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type {
  PublicOrder,
  PublicOrderEvent,
  PublicOrderEventType,
  PublicOrderStatus,
} from "@/types/order-tracking.types"

interface OrderTrackingStatusProps {
  order: PublicOrder
}

interface Step {
  type: PublicOrderEventType
  label: string
  defaultDescription: string
  Icon: LucideIcon
}

// Visual timeline order. Indexes here drive the "reached" calculation.
const STEPS: Step[] = [
  {
    type: "payment_confirmed",
    label: "Pagamento confirmado",
    defaultDescription: "Recebemos seu pagamento",
    Icon: Check,
  },
  {
    type: "shipped",
    label: "Pedido enviado",
    defaultDescription: "Em transporte",
    Icon: Truck,
  },
  {
    type: "delivered",
    label: "Entregue",
    defaultDescription: "Pedido recebido",
    Icon: Package,
  },
]

const STATUS_INDEX: Record<PublicOrderStatus, number> = {
  paid: 0,
  shipped: 1,
  delivered: 2,
  refunded: -1,
}

export function OrderTrackingStatus({ order }: OrderTrackingStatusProps) {
  const reached = STATUS_INDEX[order.status] ?? 0
  const eventByType = mapEventsByType(order.events)

  return (
    <section>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
        Status do pedido
      </p>
      <ol className="relative space-y-1">
        {STEPS.map((step, idx) => {
          const isReached = idx <= reached
          const isCurrent = idx === reached
          const event = eventByType.get(step.type)
          const description = event?.subtitle ?? step.defaultDescription

          return (
            <li key={step.type} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500",
                    isReached
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gray-100 text-gray-400",
                  )}
                >
                  {isReached ? (
                    <step.Icon className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <step.Icon className="h-5 w-5" />
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mt-1 h-10 w-px transition-colors duration-500",
                      isReached ? "bg-emerald-500/40" : "bg-gray-200",
                    )}
                  />
                )}
              </div>
              <div className="pt-2">
                <p
                  className={cn(
                    "text-sm font-medium tracking-tight",
                    isReached ? "text-gray-900" : "text-gray-500",
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">{description}</p>
                {event && (
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {formatRelative(event.occurred_at)}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function mapEventsByType(events: PublicOrderEvent[]): Map<PublicOrderEventType, PublicOrderEvent> {
  const m = new Map<PublicOrderEventType, PublicOrderEvent>()
  for (const ev of events) {
    m.set(ev.type, ev)
  }
  return m
}

// Cheap relative-time formatter. RFC3339 in, "há X" out. Falls back to the
// raw date string if parsing fails.
function formatRelative(rfc3339: string): string {
  const then = new Date(rfc3339)
  if (Number.isNaN(then.getTime())) return rfc3339
  const diffMs = Date.now() - then.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "agora"
  if (diffMin < 60) return `há ${diffMin} min`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `há ${diffHr} h`
  const diffD = Math.floor(diffHr / 24)
  if (diffD === 1) return "há 1 dia"
  if (diffD < 7) return `há ${diffD} dias`
  return then.toLocaleDateString("pt-BR")
}
