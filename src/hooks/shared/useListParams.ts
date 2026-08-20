"use client"

import { useState, useCallback, useMemo } from "react"
import type { Pagination, Sorting } from "@/types/api.types"
import { DEFAULT_PAGINATION, DEFAULT_SORTING } from "@/types/api.types"

interface UseListParamsOptions<TFilters> {
  defaultSortBy?: string
  defaultSortOrder?: "asc" | "desc"
  defaultFilters?: TFilters
  /** Página inicial (ex.: restaurada da URL ao voltar do detalhe). */
  defaultPage?: number
  /** Busca inicial (ex.: restaurada da URL ao voltar do detalhe). */
  defaultSearch?: string
}

interface UseListParamsReturn<TFilters> {
  // State
  search: string
  pagination: Pagination
  sorting: Sorting
  filters: TFilters

  // Setters
  setSearch: (search: string) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSorting: (sorting: Sorting) => void
  setFilters: (filters: TFilters) => void
  resetFilters: () => void
  resetAll: () => void

  // Combined params for API calls
  params: {
    search?: string
    pagination: Pagination
    sorting: Sorting
    filters: TFilters
  }
}

export function useListParams<TFilters extends object>(
  options?: UseListParamsOptions<TFilters>
): UseListParamsReturn<TFilters> {
  const defaultFilters = useMemo(
    () => (options?.defaultFilters || {}) as TFilters,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [search, setSearchState] = useState(options?.defaultSearch ?? "")
  const [pagination, setPagination] = useState<Pagination>({
    ...DEFAULT_PAGINATION,
    page: Math.max(1, options?.defaultPage ?? DEFAULT_PAGINATION.page),
  })
  const [sorting, setSortingState] = useState<Sorting>({
    sortBy: options?.defaultSortBy || DEFAULT_SORTING.sortBy,
    sortOrder: options?.defaultSortOrder || DEFAULT_SORTING.sortOrder,
  })
  const [filters, setFiltersState] = useState<TFilters>(defaultFilters)

  // When search changes, reset to page 1
  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setPagination({ page: 1, limit })
  }, [])

  const setSorting = useCallback((newSorting: Sorting) => {
    setSortingState(newSorting)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  // When filters change, reset to page 1
  const setFilters = useCallback((newFilters: TFilters) => {
    setFiltersState(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [defaultFilters])

  const resetAll = useCallback(() => {
    setSearchState("")
    setPagination({ ...DEFAULT_PAGINATION })
    setSortingState({
      sortBy: options?.defaultSortBy || DEFAULT_SORTING.sortBy,
      sortOrder: options?.defaultSortOrder || DEFAULT_SORTING.sortOrder,
    })
    setFiltersState(defaultFilters)
  }, [defaultFilters, options?.defaultSortBy, options?.defaultSortOrder])

  // Combined params for API calls
  const params = useMemo(
    () => ({
      search: search || undefined,
      pagination,
      sorting,
      filters,
    }),
    [search, pagination, sorting, filters]
  )

  return {
    search,
    pagination,
    sorting,
    filters,
    setSearch,
    setPage,
    setLimit,
    setSorting,
    setFilters,
    resetFilters,
    resetAll,
    params,
  }
}
