"use client"

import { OrderDetailItems } from "./OrderDetail.Items"
import { OrderDetailUpsell } from "./OrderDetail.Upsell"

// ItemsTab combines the full product table with the cart-mutation log because
// upsell/downsell is semantically about "the items the buyer ended up with vs
// the ones they started with" — keeping them on the same tab lets the merchant
// see deltas without context-switching.
export function OrderDetailItemsTab() {
  return (
    <div className="flex flex-col gap-4">
      <OrderDetailItems />
      <OrderDetailUpsell />
    </div>
  )
}
