"use client"

import { use } from "react"
import { OrderLogistics } from "@/components/order/OrderLogistics"
import { OrderDetailContext } from "./OrderDetailContext"

export function OrderDetailLogistics() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  return <OrderLogistics order={ctx.state.order} />
}
