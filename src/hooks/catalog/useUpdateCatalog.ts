"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { catalogService } from "@/services/api/catalog.service"
import { useStoreId } from "@/hooks/useUser"
import type { Catalog, UpdateCatalogPayload } from "@/types/catalog.types"
import { catalogKeys } from "./useCatalogs"

interface UpdateCatalogArgs {
  id: string
  payload: UpdateCatalogPayload
}

export function useUpdateCatalog() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateCatalogArgs): Promise<Catalog> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return catalogService.update(storeId, id, payload, token)
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: catalogKeys.detail(storeId, id) })
      }
    },
  })
}
