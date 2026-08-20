"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  persistOrderListSnapshot,
  useOrders,
  useOrderStats,
} from "@/hooks/order"
import { useDebounce } from "@/hooks/shared/useDebounce"
import { useListParams } from "@/hooks/shared/useListParams"
import { useListUrlMirror } from "@/hooks/shared/useListUrlState"
import { useStoreId } from "@/hooks/useUser"
import type { OrderFilters } from "@/types/cart.types"
import {
  OrderListContext,
  type OrderListContextValue,
} from "./OrderListContext"
import { getOrderTabFilters, ORDER_TABS, type OrderTabId } from "./OrderList.Tabs"

interface ProviderProps {
  children: React.ReactNode
}

const DEFAULT_TAB: OrderTabId = "all"

// Merges the tab pre-set on top of the user-applied filters. Tab keys win on
// overlap so switching tab is predictable; remaining keys (period, value range,
// liveSessionId) compose freely.
function mergeFilters(
  tabFilters: OrderFilters,
  userFilters: OrderFilters,
): OrderFilters {
  const merged: OrderFilters = { ...userFilters }
  if (tabFilters.status !== undefined) merged.status = tabFilters.status
  if (tabFilters.paymentStatus !== undefined)
    merged.paymentStatus = tabFilters.paymentStatus
  if (tabFilters.hasShipment !== undefined)
    merged.hasShipment = tabFilters.hasShipment
  if (tabFilters.shipmentStatus !== undefined)
    merged.shipmentStatus = tabFilters.shipmentStatus
  if (tabFilters.erpFinalisation !== undefined)
    merged.erpFinalisation = tabFilters.erpFinalisation
  if (tabFilters.needsAttention !== undefined)
    merged.needsAttention = tabFilters.needsAttention
  return merged
}

export function OrderListProvider({ children }: ProviderProps) {
  const router = useRouter()

  // Página, aba e busca nascem da URL e voltam para ela (efeito abaixo).
  // Antes viviam só em useState: navegar para o detalhe e voltar destruía o
  // estado, e quem estava na página 3 recomeçava da 1 — reclamação do
  // cliente em 20/08/2026.
  const searchParams = useSearchParams()
  const urlPage = parseInt(searchParams.get("page") ?? "", 10)
  const urlTab = searchParams.get("tab")
  const initialTab: OrderTabId = ORDER_TABS.some((t) => t.id === urlTab)
    ? (urlTab as OrderTabId)
    : DEFAULT_TAB

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "")
  const debouncedSearch = useDebounce(searchInput, 300)
  const [activeTab, setActiveTabState] = useState<OrderTabId>(initialTab)

  const { filters, setFilters, pagination, setPage, sorting, setSorting } =
    useListParams<OrderFilters>({
      defaultPage: Number.isNaN(urlPage) ? 1 : urlPage,
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

  const effectiveFilters = useMemo(
    () => mergeFilters(getOrderTabFilters(activeTab), filters),
    [activeTab, filters],
  )

  const params = {
    search: debouncedSearch || undefined,
    pagination,
    sorting,
    filters: effectiveFilters,
  }

  const { data, isLoading, error } = useOrders(params)
  const { data: stats, isLoading: isStatsLoading } = useOrderStats({
    search: debouncedSearch || undefined,
    filters: effectiveFilters,
  })

  const { storeId } = useStoreId()

  // Espelha página/aba/busca na URL e grava a URL para o "Voltar" do detalhe
  // (padrão de toda listagem — skill list-url-state).
  useListUrlMirror(
    "/orders",
    {
      page: pagination.page > 1 ? String(pagination.page) : null,
      tab: activeTab !== DEFAULT_TAB ? activeTab : null,
      q: searchInput || null,
    },
    storeId ?? undefined,
  )

  // Snapshot the page of order ids the merchant is currently browsing so the
  // detail screen can offer prev/next navigation that respects the active
  // filter / sort / page. Refreshes whenever the listing data changes.
  useEffect(() => {
    if (!storeId || !data?.data) return
    persistOrderListSnapshot(
      storeId,
      data.data.map((o) => ({ id: o.id, shortId: o.shortId })),
    )
  }, [data, storeId])

  const openOrder = useCallback(
    (id: string) => router.push(`/orders/${id}`),
    [router],
  )

  const setActiveTab = useCallback(
    (tab: OrderTabId) => {
      setActiveTabState(tab)
      setPage(1)
    },
    [setPage],
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
      sorting,
      stats,
      isStatsLoading,
      activeTab,
    },
    actions: {
      setSearch: setSearchInput,
      setFilters,
      setPage,
      toggleSort,
      openOrder,
      setActiveTab,
    },
  }

  return <OrderListContext value={value}>{children}</OrderListContext>
}
