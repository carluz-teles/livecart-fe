"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import type { Product } from "@/types/product.types"
import { productKeys } from "./useProducts"

export function useProduct(id: string | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: productKeys.detail(storeId ?? "", id || ""),
    queryFn: async (): Promise<Product> => {
      if (!id) throw new Error("Product ID is required")
      const token = await getToken()
      return productService.getById(storeId!, id, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
