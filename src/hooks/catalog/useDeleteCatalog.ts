"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { catalogService } from "@/services/api/catalog.service"
import { useStoreId } from "@/hooks/useUser"
import { catalogKeys } from "./useCatalogs"

export function useDeleteCatalog() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return catalogService.remove(storeId, id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.lists() })
    },
  })
}
