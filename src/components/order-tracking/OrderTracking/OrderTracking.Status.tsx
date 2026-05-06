"use client"

import { Check, Clock, Package, Truck, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { PublicOrder, PublicOrderStatus } from "@/types/order-tracking.types"

interface OrderTrackingStatusProps {
  order: PublicOrder
}

interface Step {
  id: PublicOrderStatus | "pending"
  label: string
  description: string
  Icon: LucideIcon
}

const STEPS: Step[] = [
  {
    id: "paid",
    label: "Pagamento confirmado",
    description: "Recebemos seu pagamento",
    Icon: Check,
  },
  {
    id: "shipped",
    label: "Pedido enviado",
    description: "Em transporte",
    Icon: Truck,
  },
  {
    id: "delivered",
    label: "Entregue",
    description: "Pedido recebido",
    Icon: Package,
  },
]

const ORDER: PublicOrderStatus[] = ["paid", "shipped", "delivered"]

function reachedFor(status: PublicOrderStatus): number {
  const i = ORDER.indexOf(status)
  return i < 0 ? -1 : i
}

export function OrderTrackingStatus({ order }: OrderTrackingStatusProps) {
  const reached = reachedFor(order.status)

  return (
    <section>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
        Status do pedido
      </p>
      <ol className="relative space-y-1">
        {STEPS.map((step, idx) => {
          const isReached = idx <= reached
          const isCurrent = idx === reached
          return (
            <li key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500",
                    isReached
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gray-100 text-gray-400",
                  )}
                >
                  {isCurrent && !isReached && (
                    <Clock className="h-5 w-5" />
                  )}
                  {isReached && <step.Icon className="h-5 w-5" />}
                  {!isCurrent && !isReached && <step.Icon className="h-5 w-5" />}
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
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
