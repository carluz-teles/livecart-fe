"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { EndEventPayload, EndEventResponse } from "@/types/event.types"
import { eventKeys } from "./useEvents"

interface EndEventParams {
  id: string
  payload?: EndEventPayload
}

export function useEndEvent() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: EndEventParams): Promise<EndEventResponse> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.end(storeId, id, payload, token)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(storeId!, id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.stats(storeId!) })
    },
  })
}
