"use client"

import { OrderDetailProvider } from "./OrderDetail.Provider"
import { OrderDetailHeader } from "./OrderDetail.Header"
import { OrderDetailActions } from "./OrderDetail.Actions"
import { OrderDetailCustomer } from "./OrderDetail.Customer"
import { OrderDetailPayment } from "./OrderDetail.Payment"
import { OrderDetailShipping } from "./OrderDetail.Shipping"
import { OrderDetailItems } from "./OrderDetail.Items"
import { OrderDetailLiveContext } from "./OrderDetail.LiveContext"
import { OrderDetailLogistics } from "./OrderDetail.Logistics"
import { OrderDetailSkeleton } from "./OrderDetail.Skeleton"
import { OrderDetailNotFound } from "./OrderDetail.NotFound"

interface FrameProps {
  children: React.ReactNode
}

function OrderDetailFrame({ children }: FrameProps) {
  return <div className="flex flex-col gap-6">{children}</div>
}

interface SidebarProps {
  children: React.ReactNode
}

function OrderDetailSidebar({ children }: SidebarProps) {
  return <aside className="space-y-4">{children}</aside>
}

interface MainProps {
  children: React.ReactNode
}

function OrderDetailMain({ children }: MainProps) {
  return <section className="space-y-4">{children}</section>
}

interface BodyProps {
  children: React.ReactNode
}

function OrderDetailBody({ children }: BodyProps) {
  return <div className="grid gap-4 lg:grid-cols-3 [&>section]:lg:col-span-2">{children}</div>
}

export const OrderDetail = {
  Provider: OrderDetailProvider,
  Frame: OrderDetailFrame,
  Body: OrderDetailBody,
  Main: OrderDetailMain,
  Sidebar: OrderDetailSidebar,
  Header: OrderDetailHeader,
  Actions: OrderDetailActions,
  Customer: OrderDetailCustomer,
  Payment: OrderDetailPayment,
  Shipping: OrderDetailShipping,
  Items: OrderDetailItems,
  LiveContext: OrderDetailLiveContext,
  Logistics: OrderDetailLogistics,
  Skeleton: OrderDetailSkeleton,
  NotFound: OrderDetailNotFound,
}
