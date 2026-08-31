"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { catalogService } from "@/services/api/catalog.service"
import { useStoreId } from "@/hooks/useUser"
import type { CatalogProduct } from "@/types/catalog.types"
import { catalogKeys } from "./useCatalogs"

interface SetCatalogProductsArgs {
  id: string
  productIds: string[]
}

export function useSetCatalogProducts() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, productIds }: SetCatalogProductsArgs): Promise<CatalogProduct[]> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return catalogService.setProducts(storeId, id, productIds, token)
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: catalogKeys.detail(storeId, id) })
      }
    },
  })
}
