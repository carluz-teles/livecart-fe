"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventComment } from "@/types/event.types"
import { eventKeys } from "./useEvents"

export function useEventComments(eventId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.detailComments(storeId ?? "", eventId),
    queryFn: async (): Promise<EventComment[]> => {
      const token = await getToken()
      const response = await eventService.listComments(storeId!, eventId, token)
      return response.data
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
