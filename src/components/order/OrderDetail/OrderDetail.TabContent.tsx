"use client"

import { use } from "react"
import { OrderDetailContext } from "./OrderDetailContext"
import { OrderDetailEventsTab } from "./OrderDetail.EventsTab"
import { OrderDetailLogisticsTab } from "./OrderDetail.LogisticsTab"
import { OrderDetailSummaryTab } from "./OrderDetail.SummaryTab"

// Renders the active tab's content based on the context's activeTab. Lives as
// its own component (rather than a switch in the page) so the page stays
// declarative and the compound API exposes the panel as a single primitive.
export function OrderDetailTabContent() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  switch (ctx.state.activeTab) {
    case "summary":
      return <OrderDetailSummaryTab />
    case "logistics":
      return <OrderDetailLogisticsTab />
    case "events":
      return <OrderDetailEventsTab />
  }
}
