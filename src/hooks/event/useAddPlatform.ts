"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { AddPlatformPayload, EventPlatform } from "@/types/event.types"
import { eventKeys } from "./useEvents"

interface AddPlatformParams {
  eventId: string
  sessionId: string
  payload: AddPlatformPayload
}

export function useAddPlatform() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, sessionId, payload }: AddPlatformParams): Promise<EventPlatform> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.addPlatform(storeId, eventId, sessionId, payload, token)
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
    },
  })
}
