"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { catalogService } from "@/services/api/catalog.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateCatalogPayload, Catalog } from "@/types/catalog.types"
import { catalogKeys } from "./useCatalogs"

export function useCreateCatalog() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCatalogPayload): Promise<Catalog> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return catalogService.create(storeId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.lists() })
    },
  })
}
