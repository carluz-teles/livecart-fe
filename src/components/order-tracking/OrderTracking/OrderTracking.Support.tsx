"use client"

import { Mail } from "lucide-react"

import type { PublicOrder } from "@/types/order-tracking.types"

interface OrderTrackingSupportProps {
  order: PublicOrder
}

export function OrderTrackingSupport({ order }: OrderTrackingSupportProps) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4">
      <p className="text-sm font-medium text-gray-900">Precisa de ajuda?</p>
      <p className="mt-1 text-sm text-gray-600">
        Fale direto com {order.store_name} respondendo o email de confirmação que
        enviamos para <span className="font-medium">{order.customer_email}</span>.
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
        <Mail className="h-3.5 w-3.5" />
        <span>Resposta direta no email do pedido</span>
      </div>
    </section>
  )
}
