"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"
import type { ApiError, ERPProductSearchResponse } from "@/types"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useSearchERPProducts(integrationId: string, search: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()
  const debouncedSearch = useDebounce(search.trim(), 500)
  const currentSearch = search.trim()

  const settling = search.trim() !== debouncedSearch
  const query = useQuery<ERPProductSearchResponse, ApiError>({
    // Detach from the previous query immediately, including during debounce.
    // Merely disabling the same query leaves its request running until later.
    queryKey: [...integrationKeys.all, "erp-products", storeId, integrationId, currentSearch],
    queryFn: async ({ signal }): Promise<ERPProductSearchResponse> => {
      const token = await getToken()
      try {
        return await integrationService.searchProducts(
          storeId!,
          integrationId,
          currentSearch,
          token,
          signal,
        )
      } catch (err) {
        const apiError = err as ApiError
        // 404 "Produto não encontrado no ERP" é um estado vazio, não um erro destrutivo
        if (apiError?.status === 404 && apiError?.error?.toLowerCase().includes("produto")) {
          return { products: [], totalCount: 0, hasMore: false }
        }
        throw apiError
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    // A timeout must not silently turn a 30s search into three attempts.
    // The error state provides an explicit retry action.
    retry: false,
    enabled:
      isLoaded &&
      isSignedIn &&
      !storeLoading &&
      !!storeId &&
      !!integrationId &&
      !settling && debouncedSearch.length >= 2,
  })
  return { ...query, data: settling ? undefined : query.data, isLoading: settling || query.isLoading, isError: !settling && query.isError }
}
