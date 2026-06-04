"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventPulse } from "@/types/event.types"
import { eventKeys } from "./useEvents"

/**
 * Polls the cheap per-event "pulse" (counters + last cart change) so the detail
 * screen can refresh in near-real-time without re-running the heavy queries on
 * every tick. The pulse is a single indexed read; the consumer compares it and
 * only refetches the list that actually moved.
 *
 * `enabled` should be false for ended events and while the tab is hidden — there
 * is nothing to watch then, so we keep the cost at zero.
 */
export function useEventPulse(eventId: string, enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.detailPulse(storeId ?? "", eventId),
    queryFn: async (): Promise<EventPulse> => {
      const token = await getToken()
      return eventService.getPulse(storeId!, eventId, token)
    },
    enabled:
      enabled && isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
    // The pulse is the polling primitive — keep it fresh every tick and pause it
    // when the tab is in the background (nothing to react to while unseen).
    refetchInterval: enabled ? 4000 : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
}
