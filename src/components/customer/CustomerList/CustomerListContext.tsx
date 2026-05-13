"use client"

import { createContext } from "react"
import type {
  Customer,
  CustomerFilters,
  CustomerStats,
} from "@/types/customer.types"
import type { Pagination, Sorting } from "@/types/api.types"

export interface CustomerListState {
  customers: Customer[]
  isLoading: boolean
  error: Error | null
  total: number
  totalPages: number
  search: string
  filters: CustomerFilters
  pagination: Pagination
  sorting: Sorting
  stats: CustomerStats | undefined
  isStatsLoading: boolean
  selectedCustomerId: string | null
  // Set of currently-blocked handles (lower-cased) for the active store.
  // Used by Table rows for the "Bloqueado" badge and by Toolbar for the
  // "Apenas bloqueados" toggle.
  blockedHandles: Set<string>
  showBlockedOnly: boolean
}

export interface CustomerListActions {
  setSearch: (search: string) => void
  setFilters: (filters: CustomerFilters) => void
  setPage: (page: number) => void
  toggleSort: (column: string) => void
  openCustomer: (id: string) => void
  closeCustomer: () => void
  setShowBlockedOnly: (value: boolean) => void
}

export interface CustomerListContextValue {
  state: CustomerListState
  actions: CustomerListActions
}

export const CustomerListContext = createContext<CustomerListContextValue | null>(null)
