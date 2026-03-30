"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateSessionPayload, EventSession } from "@/types/event.types"
import { eventKeys } from "./useEvents"

interface CreateSessionParams {
  eventId: string
  payload: CreateSessionPayload
}

export function useCreateSession() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, payload }: CreateSessionParams): Promise<EventSession> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.createSession(storeId, eventId, payload, token)
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, eventId) })
    },
  })
}
