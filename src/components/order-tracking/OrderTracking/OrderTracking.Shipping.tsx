"use client"

import { Copy, MapPin, Truck } from "lucide-react"
import { useState } from "react"

import type { PublicOrder } from "@/types/order-tracking.types"

interface OrderTrackingShippingProps {
  order: PublicOrder
}

export function OrderTrackingShipping({ order }: OrderTrackingShippingProps) {
  const [copied, setCopied] = useState(false)

  if (!order.shipping_address && !order.shipping) return null

  const copyTracking = async () => {
    if (!order.shipping?.tracking_code) return
    try {
      await navigator.clipboard.writeText(order.shipping.tracking_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API can be blocked on insecure contexts — silent fail keeps
      // the UI calm.
    }
  }

  return (
    <section>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
        Entrega
      </p>
      <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
        {order.shipping_address && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {order.shipping_address.city}/{order.shipping_address.state}
              </p>
              <p className="text-xs text-gray-500">
                Endereço completo na confirmação por email
              </p>
            </div>
          </div>
        )}

        {order.shipping?.service_name && (
          <div className="flex items-start gap-3 border-t border-gray-100 pt-3">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{order.shipping.service_name}</p>
              {order.shipping.carrier && (
                <p className="text-xs text-gray-500">{order.shipping.carrier}</p>
              )}
              {order.shipping.deadline_days && order.shipping.deadline_days > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Prazo estimado: {order.shipping.deadline_days} dias úteis
                </p>
              )}
            </div>
          </div>
        )}

        {order.shipping?.tracking_code && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Código de rastreio
              </p>
              <p className="truncate font-mono text-sm font-semibold text-gray-900">
                {order.shipping.tracking_code}
              </p>
            </div>
            <button
              type="button"
              onClick={copyTracking}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
