"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import type { ProductStats } from "@/types/product.types"
import { productKeys } from "./useProducts"

export function useProductStats() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: productKeys.stats(storeId ?? ""),
    queryFn: async (): Promise<ProductStats> => {
      const token = await getToken()
      return productService.getStats(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
