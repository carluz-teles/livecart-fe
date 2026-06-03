"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventListParams, EventListResponse } from "@/types/event.types"

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (storeId: string, params?: EventListParams) => [...eventKeys.lists(), storeId, params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) => [...eventKeys.details(), storeId, id] as const,
  stats: (storeId: string) => [...eventKeys.all, "stats", storeId] as const,
  // Event details page
  detailStats: (storeId: string, eventId: string) => [...eventKeys.all, "detail-stats", storeId, eventId] as const,
  detailCarts: (storeId: string, eventId: string) => [...eventKeys.all, "detail-carts", storeId, eventId] as const,
  detailComments: (storeId: string, eventId: string) => [...eventKeys.all, "detail-comments", storeId, eventId] as const,
  detailProducts: (storeId: string, eventId: string) => [...eventKeys.all, "detail-products", storeId, eventId] as const,
  // Live mode
  liveMode: (storeId: string, eventId: string) => [...eventKeys.all, "live-mode", storeId, eventId] as const,
  // Whitelist & Upsells
  whitelist: (storeId: string, eventId: string) => [...eventKeys.all, "whitelist", storeId, eventId] as const,
  upsells: (storeId: string, eventId: string) => [...eventKeys.all, "upsells", storeId, eventId] as const,
}

export function useEvents(params?: EventListParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.list(storeId ?? "", params),
    queryFn: async (): Promise<EventListResponse> => {
      const token = await getToken()
      return eventService.list(storeId!, params, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
