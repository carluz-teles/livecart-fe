"use client"

import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useBlockedHandles, useCustomers, useCustomerStats } from "@/hooks/customer"
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [showBlockedOnly, setShowBlockedOnly] = useState(
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
  const { data: blockedList } = useBlockedHandles()

  // Lower-case Set so row badges + the "apenas bloqueados" filter share a
  // single source of truth and avoid re-normalizing per render.
  const blockedHandles = useMemo(() => {
    return new Set((blockedList?.data ?? []).map((b) => b.handle.toLowerCase()))
  }, [blockedList])

  const customers = data?.data ?? []
  const filteredCustomers = showBlockedOnly
    ? customers.filter((c) => blockedHandles.has(c.handle.toLowerCase()))
    : customers

  const value: CustomerListContextValue = {
    state: {
      customers: filteredCustomers,
      isLoading,
      error: error as Error | null,
      total: showBlockedOnly ? filteredCustomers.length : data?.pagination.total ?? 0,
      totalPages: showBlockedOnly ? 1 : data?.pagination.totalPages ?? 0,
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
      setSearch: setSearchInput,
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
