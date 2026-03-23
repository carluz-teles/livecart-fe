"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import type { UpdateProductPayload, Product } from "@/types/product.types"
import { productKeys } from "./useProducts"

interface UpdateProductParams {
  id: string
  payload: UpdateProductPayload
}

export function useUpdateProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateProductParams): Promise<Product> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return productService.update(storeId, id, payload, token)
    },
    onSuccess: (data, variables) => {
      if (storeId) {
        queryClient.setQueryData(productKeys.detail(storeId, variables.id), data)
      }
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
