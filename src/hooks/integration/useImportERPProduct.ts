"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "@/hooks/product/useProducts"
import { productGroupKeys } from "@/hooks/product-group/useProductGroups"

interface ImportArgs {
  integrationId: string
  tinyProductId: string
  // Omitted / empty = import every variant (backend behavior).
  variantIds?: string[]
}

export function useImportERPProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ integrationId, tinyProductId, variantIds }: ImportArgs) => {
      if (!storeId) throw new Error("Store ID not found")
      const token = await getToken()
      return integrationService.importProduct(
        storeId,
        integrationId,
        tinyProductId,
        variantIds,
        token
      )
    },
    onSuccess: () => {
      // The import can persist a group + N products in one call; refresh both
      // catalog lists and stats so the new entries show up immediately.
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productGroupKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.stats(storeId) })
      }
    },
  })
}
