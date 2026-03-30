"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventDetailStatsResponse } from "@/types/event.types"
import { eventKeys } from "./useEvents"

export function useEventDetailStats(eventId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.detailStats(storeId ?? "", eventId),
    queryFn: async (): Promise<EventDetailStatsResponse> => {
      const token = await getToken()
      return eventService.getEventStats(storeId!, eventId, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
