"use client"

import { createContext } from "react"
import type {
  Order,
  OrderFilters,
  OrderStats,
} from "@/types/cart.types"
import type { Pagination, Sorting } from "@/types/api.types"
import type { OrderTabId } from "./OrderList.Tabs"

export interface OrderListState {
  orders: Order[]
  isLoading: boolean
  error: Error | null
  total: number
  totalPages: number
  search: string
  // User-applied filters (from the lateral filter panel). Tab pre-sets are
  // applied on top of these at query time — the merged result is what the
  // backend sees but is not stored here.
  filters: OrderFilters
  pagination: Pagination
  sorting: Sorting
  stats: OrderStats | undefined
  isStatsLoading: boolean
  activeTab: OrderTabId
}

export interface OrderListActions {
  setSearch: (search: string) => void
  setFilters: (filters: OrderFilters) => void
  setPage: (page: number) => void
  // Toggles the sort. If clicking the active column, flips asc/desc; otherwise
  // sets the new column with desc as default.
  toggleSort: (column: string) => void
  openOrder: (id: string) => void
  setActiveTab: (tab: OrderTabId) => void
}

export interface OrderListContextValue {
  state: OrderListState
  actions: OrderListActions
}

export const OrderListContext = createContext<OrderListContextValue | null>(null)
