"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventUpsell } from "@/types/event.types"
import { eventKeys } from "./useEvents"

/**
 * Hook to fetch upsells for an event
 */
export function useEventUpsells(eventId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.upsells(storeId ?? "", eventId),
    queryFn: async (): Promise<EventUpsell[]> => {
      const token = await getToken()
      const response = await eventService.listUpsells(storeId!, eventId, token)
      return response.data
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
