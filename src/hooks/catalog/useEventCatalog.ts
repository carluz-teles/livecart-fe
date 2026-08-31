"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { catalogService } from "@/services/api/catalog.service"
import { useStoreId } from "@/hooks/useUser"
import type { CatalogDetail, ApiError } from "@/types"
import { catalogKeys } from "./useCatalogs"

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as ApiError).status === 404
}

/**
 * The catalog associated with an event, or `null` when it has none.
 *
 * The backend answers 404 for an event without a catalog — that is a normal
 * state ("Nenhum"), not an error, so we swallow it into `null` and never retry
 * on it.
 */
export function useEventCatalog(eventId: string | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: catalogKeys.eventLink(storeId ?? "", eventId || ""),
    queryFn: async (): Promise<CatalogDetail | null> => {
      if (!eventId) throw new Error("Event ID is required")
      const token = await getToken()
      try {
        return await catalogService.getEventCatalog(storeId!, eventId, token)
      } catch (error) {
        if (isNotFound(error)) return null
        throw error
      }
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
    retry: (failureCount, error) => !isNotFound(error) && failureCount < 2,
  })
}
