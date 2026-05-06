"use client"

import { OrderTrackingHeader } from "./OrderTracking.Header"
import { OrderTrackingStatus } from "./OrderTracking.Status"
import { OrderTrackingItems } from "./OrderTracking.Items"
import { OrderTrackingShipping } from "./OrderTracking.Shipping"
import { OrderTrackingSupport } from "./OrderTracking.Support"

import type { PublicOrder } from "@/types/order-tracking.types"

interface OrderTrackingProps {
  order: PublicOrder
}

function OrderTracking({ order }: OrderTrackingProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <OrderTrackingHeader order={order} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm shadow-gray-200/60">
          <OrderTrackingStatus order={order} />
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

export { OrderTracking }
