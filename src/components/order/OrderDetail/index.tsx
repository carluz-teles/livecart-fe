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
import { OrderDetailSkeleton } from "./OrderDetail.Skeleton"
import { OrderDetailNotFound } from "./OrderDetail.NotFound"

interface FrameProps {
  children: React.ReactNode
}

function OrderDetailFrame({ children }: FrameProps) {
  return <div className="flex flex-col gap-6">{children}</div>
}

interface CardsProps {
  children: React.ReactNode
}

function OrderDetailCards({ children }: CardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 [&>*]:h-full">{children}</div>
  )
}

export const OrderDetail = {
  Provider: OrderDetailProvider,
  Frame: OrderDetailFrame,
  Cards: OrderDetailCards,
  Header: OrderDetailHeader,
  Actions: OrderDetailActions,
  Customer: OrderDetailCustomer,
  Payment: OrderDetailPayment,
  Shipping: OrderDetailShipping,
  Items: OrderDetailItems,
  Timeline: OrderDetailTimeline,
  Logistics: OrderDetailLogistics,
  Skeleton: OrderDetailSkeleton,
  NotFound: OrderDetailNotFound,
}
