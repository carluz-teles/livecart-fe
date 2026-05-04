"use client"

import { createContext } from "react"
import type { OrderDetail } from "@/types/cart.types"

export type OrderDetailTabId =
  | "summary"
  | "items"
  | "logistics"
  | "events"
  | "notes"

export interface OrderDetailState {
  order: OrderDetail
  activeTab: OrderDetailTabId
}

export interface OrderDetailActions {
  refund: () => void
  isRefunding: boolean
  print: () => void
  setActiveTab: (tab: OrderDetailTabId) => void
}

export interface OrderDetailMeta {
  storeId: string
}

export interface OrderDetailContextValue {
  state: OrderDetailState
  actions: OrderDetailActions
  meta: OrderDetailMeta
}

export const OrderDetailContext = createContext<OrderDetailContextValue | null>(null)
