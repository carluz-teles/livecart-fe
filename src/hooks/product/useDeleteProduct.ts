"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "./useProducts"

export function useDeleteProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return productService.delete(storeId, id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.stats(storeId) })
      }
    },
  })
}
