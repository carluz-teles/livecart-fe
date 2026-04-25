"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productGroupService } from "@/services/api/productGroup.service"
import { useStoreId } from "@/hooks/useUser"
import { productGroupKeys } from "./useProductGroups"
import { productKeys } from "@/hooks/product/useProducts"
import type { CreateProductGroupPayload } from "@/types"

export function useCreateProductGroup() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateProductGroupPayload) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return productGroupService.create(storeId, payload, token)
    },
    onSuccess: () => {
      // Group creation persists N variants as products too — invalidate both
      // caches so the listing reflects the new rows immediately.
      queryClient.invalidateQueries({ queryKey: productGroupKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.stats(storeId) })
      }
    },
  })
}
