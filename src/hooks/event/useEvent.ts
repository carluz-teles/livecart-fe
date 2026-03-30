"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { Event } from "@/types/event.types"
import { eventKeys } from "./useEvents"

export function useEvent(id: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: eventKeys.detail(storeId ?? "", id),
    queryFn: async (): Promise<Event> => {
      const token = await getToken()
      return eventService.getById(storeId!, id, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
