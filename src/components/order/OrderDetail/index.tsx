"use client"

import { OrderDetailProvider } from "./OrderDetail.Provider"
import { OrderDetailHeader } from "./OrderDetail.Header"
import { OrderDetailActions } from "./OrderDetail.Actions"
import { OrderDetailCustomer } from "./OrderDetail.Customer"
import { OrderDetailPayment } from "./OrderDetail.Payment"
import { OrderDetailShipping } from "./OrderDetail.Shipping"
import { OrderDetailItems } from "./OrderDetail.Items"
import { OrderDetailLogistics } from "./OrderDetail.Logistics"
import { OrderDetailTimeline } from "./OrderDetail.Timeline"
import { OrderDetailUpsell } from "./OrderDetail.Upsell"
import { OrderDetailSkeleton } from "./OrderDetail.Skeleton"
import { OrderDetailNotFound } from "./OrderDetail.NotFound"
import { OrderDetailTabs } from "./OrderDetail.Tabs"
import { OrderDetailTabContent } from "./OrderDetail.TabContent"
import { OrderDetailSummaryTab } from "./OrderDetail.SummaryTab"
import { OrderDetailItemsTab } from "./OrderDetail.ItemsTab"
import { OrderDetailLogisticsTab } from "./OrderDetail.LogisticsTab"
import { OrderDetailEventsTab } from "./OrderDetail.EventsTab"
import { OrderDetailNotesTab } from "./OrderDetail.NotesTab"

interface FrameProps {
  children: React.ReactNode
}

function OrderDetailFrame({ children }: FrameProps) {
  return <div className="flex flex-col gap-6">{children}</div>
}

// Customer/Payment/Shipping/Items/Upsell/Timeline/Logistics are still
// exported because the tab components compose them internally — and external
// callers may reuse them in print templates or future surfaces. Cards
// container was removed when the layout moved from "vertical scroll of
// cards" to "tabs"; SummaryTab now owns its own internal grid.
export const OrderDetail = {
  Provider: OrderDetailProvider,
  Frame: OrderDetailFrame,
  Header: OrderDetailHeader,
  Actions: OrderDetailActions,
  Tabs: OrderDetailTabs,
  TabContent: OrderDetailTabContent,
  // Tab panels (usually rendered via TabContent based on activeTab).
  SummaryTab: OrderDetailSummaryTab,
  ItemsTab: OrderDetailItemsTab,
  LogisticsTab: OrderDetailLogisticsTab,
  EventsTab: OrderDetailEventsTab,
  NotesTab: OrderDetailNotesTab,
  // Building blocks reused by tabs and any future surface.
  Customer: OrderDetailCustomer,
  Payment: OrderDetailPayment,
  Shipping: OrderDetailShipping,
  Items: OrderDetailItems,
  Upsell: OrderDetailUpsell,
  Timeline: OrderDetailTimeline,
  Logistics: OrderDetailLogistics,
  Skeleton: OrderDetailSkeleton,
  NotFound: OrderDetailNotFound,
}
