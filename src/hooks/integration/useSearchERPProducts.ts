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
  const debouncedSearch = useDebounce(search, 300)

  return useQuery<ERPProductSearchResponse, ApiError>({
    queryKey: [...integrationKeys.all, "erp-products", integrationId, debouncedSearch],
    queryFn: async (): Promise<ERPProductSearchResponse> => {
      const token = await getToken()
      try {
        return await integrationService.searchProducts(
          storeId!,
          integrationId,
          debouncedSearch,
          token,
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
    retry: (failureCount, error) => {
      if (error?.status && error.status >= 400 && error.status < 500) return false
      // 503 é o ERP pedindo para esperar. Repetir sozinho empurra mais consulta
      // no limitador que acabou de recusar — quem decide tentar de novo é o
      // lojista, depois de ler a mensagem.
      if (error?.status === 503) return false
      return failureCount < 2
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
