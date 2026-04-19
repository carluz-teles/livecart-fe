"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import type { SetActiveProductPayload } from "@/types/event.types"
import { eventKeys } from "./useEvents"

interface SetActiveProductParams {
  eventId: string
  payload: SetActiveProductPayload
}

export function useSetActiveProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, payload }: SetActiveProductParams): Promise<void> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.setActiveProduct(storeId, eventId, payload, token)
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.liveMode(storeId!, eventId) })
    },
  })
}
