"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { LiveModeState } from "@/types/event.types"
import { eventKeys } from "./useEvents"

interface UseLiveModeStateOptions {
  enabled?: boolean
  refetchInterval?: number | false
}

export function useLiveModeState(
  eventId: string,
  options: UseLiveModeStateOptions = {}
) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  const { enabled = true, refetchInterval = 5000 } = options

  return useQuery({
    queryKey: eventKeys.liveMode(storeId ?? "", eventId),
    queryFn: async (): Promise<LiveModeState> => {
      const token = await getToken()
      return eventService.getLiveModeState(storeId!, eventId, token)
    },
    enabled: enabled && isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
    refetchInterval,
  })
}
