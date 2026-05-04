"use client"

import { createContext } from "react"
import type { OrderDetail } from "@/types/cart.types"

export interface OrderDetailState {
  order: OrderDetail
}

export interface OrderDetailActions {
  refund: () => void
  isRefunding: boolean
  print: () => void
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
