"use client"

import { useCallback, useState } from "react"
import { useCustomers, useCustomerStats } from "@/hooks/customer"
import { useDebounce } from "@/hooks/shared/useDebounce"
import { useListParams } from "@/hooks/shared/useListParams"
import type { CustomerFilters } from "@/types/customer.types"
import {
  CustomerListContext,
  type CustomerListContextValue,
} from "./CustomerListContext"

interface ProviderProps {
  children: React.ReactNode
}

export function CustomerListProvider({ children }: ProviderProps) {
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 300)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const { filters, setFilters, pagination, setPage, sorting, setSorting } =
    useListParams<CustomerFilters>({ defaultSortBy: "last_order_at", defaultSortOrder: "desc" })

  const toggleSort = useCallback(
    (column: string) => {
      if (sorting.sortBy === column) {
        setSorting({ sortBy: column, sortOrder: sorting.sortOrder === "asc" ? "desc" : "asc" })
      } else {
        setSorting({ sortBy: column, sortOrder: "desc" })
      }
    },
    [sorting.sortBy, sorting.sortOrder, setSorting],
  )

  const params = {
    search: debouncedSearch || undefined,
    pagination,
    sorting,
    filters,
  }

  const { data, isLoading, error } = useCustomers(params)
  const { data: stats, isLoading: isStatsLoading } = useCustomerStats()

  const value: CustomerListContextValue = {
    state: {
      customers: data?.data ?? [],
      isLoading,
      error: error as Error | null,
      total: data?.pagination.total ?? 0,
      totalPages: data?.pagination.totalPages ?? 0,
      search: searchInput,
      filters,
      pagination,
      sorting,
      stats,
      isStatsLoading,
      selectedCustomerId,
    },
    actions: {
      setSearch: setSearchInput,
      setFilters,
      setPage,
      toggleSort,
      openCustomer: setSelectedCustomerId,
      closeCustomer: () => setSelectedCustomerId(null),
    },
  }

  return <CustomerListContext value={value}>{children}</CustomerListContext>
}
