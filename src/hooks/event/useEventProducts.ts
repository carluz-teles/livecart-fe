"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventProduct } from "@/types/event.types"
import { eventKeys } from "./useEvents"

export function useEventProducts(eventId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.detailProducts(storeId ?? "", eventId),
    queryFn: async (): Promise<EventProduct[]> => {
      const token = await getToken()
      const response = await eventService.listProducts(storeId!, eventId, token)
      return response.data
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!eventId,
  })
}
