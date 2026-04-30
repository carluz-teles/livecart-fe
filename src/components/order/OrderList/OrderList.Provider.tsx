"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useOrders, useOrderStats } from "@/hooks/order"
import { useDebounce } from "@/hooks/shared/useDebounce"
import { useListParams } from "@/hooks/shared/useListParams"
import type { OrderFilters } from "@/types/cart.types"
import {
  OrderListContext,
  type OrderListContextValue,
} from "./OrderListContext"

interface ProviderProps {
  children: React.ReactNode
}

export function OrderListProvider({ children }: ProviderProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 300)

  const { filters, setFilters, pagination, setPage, sorting } =
    useListParams<OrderFilters>()

  const params = {
    search: debouncedSearch || undefined,
    pagination,
    sorting,
    filters,
  }

  const { data, isLoading, error } = useOrders(params)
  const { data: stats, isLoading: isStatsLoading } = useOrderStats()

  const openOrder = useCallback(
    (id: string) => router.push(`/orders/${id}`),
    [router],
  )

  const value: OrderListContextValue = {
    state: {
      orders: data?.data ?? [],
      isLoading,
      error: error as Error | null,
      total: data?.pagination.total ?? 0,
      totalPages: data?.pagination.totalPages ?? 0,
      search: searchInput,
      filters,
      pagination,
      stats,
      isStatsLoading,
    },
    actions: {
      setSearch: setSearchInput,
      setFilters,
      setPage,
      openOrder,
    },
  }

  return <OrderListContext value={value}>{children}</OrderListContext>
}
