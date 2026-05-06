"use client"

import { OrderTrackingHeader } from "./OrderTracking.Header"
import { OrderTrackingStatus } from "./OrderTracking.Status"
import { OrderTrackingItems } from "./OrderTracking.Items"
import { OrderTrackingShipping } from "./OrderTracking.Shipping"
import { OrderTrackingSupport } from "./OrderTracking.Support"
import { OrderTrackingConfirmDelivery } from "./OrderTracking.ConfirmDelivery"

import type { PublicOrder } from "@/types/order-tracking.types"

interface OrderTrackingProps {
  order: PublicOrder
  // Forwarded from the page so the confirm-delivery action can call back
  // with the same token the user came in with. We don't keep the token in
  // hook keys to avoid leaking it into devtools cache more than necessary.
  trackingKey: string
}

function OrderTracking({ order, trackingKey }: OrderTrackingProps) {
  // Show the "Recebi!" CTA only while the order is in transit. Once the
  // status flips to `delivered` (whether by carrier poll, merchant click, or
  // this same button), the CTA hides and the timeline shows the final step.
  const canConfirmDelivery = order.status === "shipped"

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderTrackingHeader order={order} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm shadow-gray-200/60">
          <OrderTrackingStatus order={order} />
          {canConfirmDelivery && (
            <div className="border-t border-gray-100 pt-6">
              <OrderTrackingConfirmDelivery
                shortId={order.short_id}
                trackingKey={trackingKey}
              />
            </div>
          )}
          <div className="border-t border-gray-100 pt-6">
            <OrderTrackingItems order={order} />
          </div>
          <div className="border-t border-gray-100 pt-6">
            <OrderTrackingShipping order={order} />
          </div>
        </div>
        <div className="mt-4">
          <OrderTrackingSupport order={order} />
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by LiveCart
        </p>
      </main>
    </div>
  )
}

OrderTracking.Header = OrderTrackingHeader
OrderTracking.Status = OrderTrackingStatus
OrderTracking.Items = OrderTrackingItems
OrderTracking.Shipping = OrderTrackingShipping
OrderTracking.Support = OrderTrackingSupport
OrderTracking.ConfirmDelivery = OrderTrackingConfirmDelivery

export { OrderTracking }
