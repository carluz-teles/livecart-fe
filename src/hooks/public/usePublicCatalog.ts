"use client"

import { useQuery } from "@tanstack/react-query"
import { publicCatalogService } from "@/services/api/public-catalog.service"
import type { PublicCatalog } from "@/services/api/public-catalog.service"

export const publicCatalogKeys = {
  all: ["public-catalog"] as const,
  detail: (eventId: string) => [...publicCatalogKeys.all, eventId] as const,
}

/**
 * React Query hook for the public live catalog. The server-fetched catalog is
 * passed as initialData so there is no client refetch on mount.
 */
export function usePublicCatalog(
  eventId: string,
  initialData?: PublicCatalog
) {
  return useQuery({
    queryKey: publicCatalogKeys.detail(eventId),
    queryFn: (): Promise<PublicCatalog> =>
      publicCatalogService.getByEventId(eventId),
    enabled: !!eventId,
    initialData,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  })
}
