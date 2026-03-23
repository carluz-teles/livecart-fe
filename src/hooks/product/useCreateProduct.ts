"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateProductPayload, Product } from "@/types/product.types"
import { productKeys } from "./useProducts"

export function useCreateProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateProductPayload): Promise<Product> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return productService.create(storeId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
