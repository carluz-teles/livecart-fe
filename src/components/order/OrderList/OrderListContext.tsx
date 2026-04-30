"use client"

import { createContext } from "react"
import type {
  Order,
  OrderFilters,
  OrderStats,
} from "@/types/cart.types"
import type { Pagination } from "@/types/api.types"

export interface OrderListState {
  orders: Order[]
  isLoading: boolean
  error: Error | null
  total: number
  totalPages: number
  search: string
  filters: OrderFilters
  pagination: Pagination
  stats: OrderStats | undefined
  isStatsLoading: boolean
}

export interface OrderListActions {
  setSearch: (search: string) => void
  setFilters: (filters: OrderFilters) => void
  setPage: (page: number) => void
  openOrder: (id: string) => void
}

export interface OrderListContextValue {
  state: OrderListState
  actions: OrderListActions
}

export const OrderListContext = createContext<OrderListContextValue | null>(null)
