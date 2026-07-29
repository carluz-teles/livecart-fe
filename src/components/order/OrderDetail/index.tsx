"use client"

import { OrderDetailProvider } from "./OrderDetail.Provider"
import { OrderDetailHeader } from "./OrderDetail.Header"
import { OrderDetailActions } from "./OrderDetail.Actions"
import { OrderDetailBody } from "./OrderDetail.Body"
import { OrderDetailCustomer } from "./OrderDetail.Customer"
import { OrderDetailERPRetryBanner } from "./OrderDetail.ERPRetryBanner"
import { OrderDetailStatusBanner } from "./OrderDetail.StatusBanner"
import { OrderDetailHistory } from "./OrderDetail.History"
import { OrderDetailPayment } from "./OrderDetail.Payment"
import { OrderDetailShipping } from "./OrderDetail.Shipping"
import { OrderDetailItems } from "./OrderDetail.Items"
import { OrderDetailLogistics } from "./OrderDetail.Logistics"
import { OrderDetailUpsell } from "./OrderDetail.Upsell"
import { OrderDetailSkeleton } from "./OrderDetail.Skeleton"
import { OrderDetailNotFound } from "./OrderDetail.NotFound"

interface FrameProps {
  children: React.ReactNode
}

function OrderDetailFrame({ children }: FrameProps) {
  return <div className="flex flex-col gap-6">{children}</div>
}

// Page wires Header + Body and the Provider surrounds both. Building blocks
// (Customer / Payment / Shipping / Items / Upsell / Logistics / History) are
// still exported because Body composes them, and they may be reused in print
// templates or other surfaces later.
export const OrderDetail = {
  Provider: OrderDetailProvider,
  Frame: OrderDetailFrame,
  Header: OrderDetailHeader,
  Actions: OrderDetailActions,
  Body: OrderDetailBody,
  Customer: OrderDetailCustomer,
  ERPRetryBanner: OrderDetailERPRetryBanner,
  StatusBanner: OrderDetailStatusBanner,
  Payment: OrderDetailPayment,
  Shipping: OrderDetailShipping,
  Items: OrderDetailItems,
  Upsell: OrderDetailUpsell,
  Logistics: OrderDetailLogistics,
  History: OrderDetailHistory,
  Skeleton: OrderDetailSkeleton,
  NotFound: OrderDetailNotFound,
}
