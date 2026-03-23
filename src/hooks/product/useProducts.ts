"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import type { ProductListParams, ProductListResponse } from "@/types/product.types"

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (storeId: string, params?: ProductListParams) => [...productKeys.lists(), storeId, params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) => [...productKeys.details(), storeId, id] as const,
  stats: (storeId: string) => [...productKeys.all, "stats", storeId] as const,
}

export function useProducts(params?: ProductListParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: productKeys.list(storeId ?? "", params),
    queryFn: async (): Promise<ProductListResponse> => {
      const token = await getToken()
      return productService.list(storeId!, params, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
