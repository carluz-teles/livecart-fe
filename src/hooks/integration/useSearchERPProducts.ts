"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { integrationKeys } from "./useIntegrations"
import type { ERPProductSearchResponse } from "@/types"

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
  const debouncedSearch = useDebounce(search, 300)

  return useQuery({
    queryKey: [...integrationKeys.all, "erp-products", integrationId, debouncedSearch],
    queryFn: async (): Promise<ERPProductSearchResponse> => {
      const token = await getToken()
      return integrationService.searchProducts(storeId!, integrationId, debouncedSearch, token)
    },
    enabled:
      isLoaded &&
      isSignedIn &&
      !storeLoading &&
      !!storeId &&
      !!integrationId &&
      debouncedSearch.length >= 2,
  })
}
