"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventStats } from "@/types/event.types"
import { eventKeys } from "./useEvents"

export function useEventStats() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.stats(storeId ?? ""),
    queryFn: async (): Promise<EventStats> => {
      const token = await getToken()
      return eventService.getStats(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
