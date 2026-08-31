"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { catalogService } from "@/services/api/catalog.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventCatalogLink } from "@/types/catalog.types"
import { catalogKeys } from "./useCatalogs"

interface SetEventCatalogArgs {
  eventId: string
  catalogId: string | null
}

export function useSetEventCatalog() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, catalogId }: SetEventCatalogArgs): Promise<EventCatalogLink> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return catalogService.setEventCatalog(storeId, eventId, catalogId, token)
    },
    onSuccess: (_data, { eventId }) => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: catalogKeys.eventLink(storeId, eventId) })
      }
    },
  })
}
