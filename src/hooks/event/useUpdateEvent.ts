"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { UpdateEventPayload, Event } from "@/types/event.types"
import { eventKeys } from "./useEvents"

interface UpdateEventParams {
  id: string
  payload: UpdateEventPayload
}

export function useUpdateEvent() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateEventParams): Promise<Event> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.update(storeId, id, payload, token)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, id) })
    },
  })
}
