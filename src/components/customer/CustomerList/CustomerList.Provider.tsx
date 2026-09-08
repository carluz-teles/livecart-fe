"use client"

import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useCustomers, useCustomerStats } from "@/hooks/customer"
import { useDebounce } from "@/hooks/shared/useDebounce"
import { useListParams } from "@/hooks/shared/useListParams"
import { useListUrlMirror } from "@/hooks/shared/useListUrlState"
import type { CustomerFilters } from "@/types/customer.types"
import {
  CustomerListContext,
  type CustomerListContextValue,
} from "./CustomerListContext"

interface ProviderProps {
  children: React.ReactNode
}

export function CustomerListProvider({ children }: ProviderProps) {
  // Página, busca e o filtro de bloqueados nascem da URL e voltam para ela
  // (skill list-url-state): F5 e o voltar do navegador restauram a tela.
  const searchParams = useSearchParams()
  const urlPage = parseInt(searchParams.get("page") ?? "", 10)

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "")
  const debouncedSearch = useDebounce(searchInput, 300)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  )
  const [showBlockedOnly, setBlockedOnly] = useState(
    searchParams.get("bloqueados") === "1",
  )

  const { filters, setFilters, pagination, setPage, sorting, setSorting } =
    useListParams<CustomerFilters>({
      defaultSortBy: "last_order_at",
      defaultSortOrder: "desc",
      defaultPage: Number.isNaN(urlPage) ? 1 : urlPage,
    })

  useListUrlMirror("/customers", {
    page: pagination.page > 1 ? String(pagination.page) : null,
    q: searchInput || null,
    bloqueados: showBlockedOnly ? "1" : null,
  })

  const toggleSort = useCallback(
    (column: string) => {
      if (sorting.sortBy === column) {
        setSorting({
          sortBy: column,
          sortOrder: sorting.sortOrder === "asc" ? "desc" : "asc",
        })
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
    filters: { ...filters, blockedOnly: showBlockedOnly || undefined },
  }

  const { data, isLoading, isFetching, error, refetch } = useCustomers(params)
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useCustomerStats()
  const customers = data?.data ?? []
  const blockedHandles = useMemo(
    () =>
      new Set(
        (data?.data ?? [])
          .filter((customer) => customer.blocked)
          .map((customer) => customer.handle.toLowerCase()),
      ),
    [data],
  )
  const setSearch = useCallback(
    (value: string) => {
      setPage(1)
      setSearchInput(value)
    },
    [setPage],
  )
  const setShowBlockedOnly = useCallback(
    (value: boolean) => {
      setPage(1)
      setBlockedOnly(value)
    },
    [setPage],
  )

  const value: CustomerListContextValue = {
    state: {
      customers,
      isLoading: isLoading || searchInput !== debouncedSearch,
      isFetching,
      statsError,
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
      blockedHandles,
      showBlockedOnly,
    },
    actions: {
      retry: () => {
        void refetch()
        void refetchStats()
      },
      clearFilters: () => {
        setSearch("")
        setShowBlockedOnly(false)
        setFilters({})
      },
      setSearch,
      setFilters,
      setPage,
      toggleSort,
      openCustomer: setSelectedCustomerId,
      closeCustomer: () => setSelectedCustomerId(null),
      setShowBlockedOnly,
    },
  }

  return <CustomerListContext value={value}>{children}</CustomerListContext>
}
