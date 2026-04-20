"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventWhitelistProduct } from "@/types/event.types"
import { eventKeys } from "./useEvents"

/**
 * Hook to fetch whitelist products for an event
 */
export function useEventWhitelist(eventId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.whitelist(storeId ?? "", eventId),
    queryFn: async (): Promise<EventWhitelistProduct[]> => {
      const token = await getToken()
      const response = await eventService.listWhitelist(storeId!, eventId, token)
      return response.data
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
