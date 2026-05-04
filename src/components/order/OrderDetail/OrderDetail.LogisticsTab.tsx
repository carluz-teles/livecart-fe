"use client"

import { OrderDetailLogistics } from "./OrderDetail.Logistics"

// LogisticsTab is intentionally a thin wrapper for now — the heavy lifting
// (NoShipmentView / CreateShipmentSheet / ShipmentView / TrackingTimeline)
// still lives in OrderLogistics, which is on the roadmap to be split into
// smaller pieces in the next iteration.
export function OrderDetailLogisticsTab() {
  return <OrderDetailLogistics />
}
