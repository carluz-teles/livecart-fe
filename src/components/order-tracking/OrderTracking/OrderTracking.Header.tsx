"use client"

import { ShieldCheck } from "lucide-react"

import type { PublicOrder } from "@/types/order-tracking.types"

interface OrderTrackingHeaderProps {
  order: PublicOrder
}

export function OrderTrackingHeader({ order }: OrderTrackingHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-gray-100 bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {order.store_logo_url ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-xl shadow-gray-200/60">
              <img
                src={order.store_logo_url}
                alt={order.store_name}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-xl font-bold text-white shadow-xl shadow-gray-300/50">
              {order.store_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
              {order.store_name}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
              Pedido #{order.short_id}
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-gray-600">Acompanhamento seguro</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
