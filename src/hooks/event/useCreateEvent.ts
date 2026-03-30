"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateEventPayload, CreateEventResponse } from "@/types/event.types"
import { eventKeys } from "./useEvents"

export function useCreateEvent() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateEventPayload): Promise<CreateEventResponse> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.create(storeId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.stats(storeId!) })
    },
  })
}
