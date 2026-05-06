"use client"

import { Package } from "lucide-react"

import type { PublicOrder } from "@/types/order-tracking.types"

interface OrderTrackingItemsProps {
  order: PublicOrder
}

function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`
}

export function OrderTrackingItems({ order }: OrderTrackingItemsProps) {
  return (
    <section>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
        Itens do pedido
      </p>
      <ul className="space-y-2">
        {order.items.map((item, idx) => (
          <li
            key={`${item.product_name}-${idx}`}
            className="flex items-center gap-4 rounded-xl bg-gray-50 p-3"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white">
              {item.product_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.product_image_url}
                  alt={item.product_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {item.product_name}
              </p>
              <p className="text-xs text-gray-500">
                {item.quantity} × {formatCurrency(item.unit_price_cents)}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(item.line_total_cents)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 rounded-xl border border-gray-100 bg-white p-4">
        <Row label="Subtotal" value={formatCurrency(order.subtotal_cents)} />
        {order.shipping_cents > 0 ? (
          <Row label="Frete" value={formatCurrency(order.shipping_cents)} />
        ) : (
          <Row label="Frete" value="Grátis" valueClass="text-emerald-600 font-medium" />
        )}
        {order.discount_cents > 0 && (
          <Row
            label="Desconto"
            value={`− ${formatCurrency(order.discount_cents)}`}
            valueClass="text-emerald-600"
          />
        )}
        <div className="mt-2 border-t border-gray-100 pt-2">
          <Row
            label="Total"
            value={formatCurrency(order.total_cents)}
            labelClass="font-semibold text-gray-900"
            valueClass="font-semibold text-gray-900 text-base"
          />
        </div>
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  labelClass,
  valueClass,
}: {
  label: string
  value: string
  labelClass?: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={labelClass ?? "text-gray-600"}>{label}</span>
      <span className={valueClass ?? "text-gray-900"}>{value}</span>
    </div>
  )
}
