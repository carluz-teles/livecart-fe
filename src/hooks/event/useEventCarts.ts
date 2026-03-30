"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventCart } from "@/types/event.types"
import { eventKeys } from "./useEvents"

export function useEventCarts(eventId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.detailCarts(storeId ?? "", eventId),
    queryFn: async (): Promise<EventCart[]> => {
      const token = await getToken()
      const response = await eventService.listCarts(storeId!, eventId, token)
      return response.data
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
