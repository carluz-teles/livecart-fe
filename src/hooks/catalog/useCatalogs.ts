"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { catalogService } from "@/services/api/catalog.service"
import { useStoreId } from "@/hooks/useUser"
import type { Catalog } from "@/types/catalog.types"

export const catalogKeys = {
  all: ["catalogs"] as const,
  lists: () => [...catalogKeys.all, "list"] as const,
  list: (storeId: string) => [...catalogKeys.lists(), storeId] as const,
  details: () => [...catalogKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) => [...catalogKeys.details(), storeId, id] as const,
  // The catalog associated with an event (keyed by event id).
  eventLink: (storeId: string, eventId: string) =>
    [...catalogKeys.all, "event", storeId, eventId] as const,
}

export function useCatalogs() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: catalogKeys.list(storeId ?? ""),
    queryFn: async (): Promise<Catalog[]> => {
      const token = await getToken()
      return catalogService.list(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
