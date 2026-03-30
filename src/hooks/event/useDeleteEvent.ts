"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { eventService } from "@/services/api/event.service"
import { useStoreId } from "@/hooks/useUser"
import { eventKeys } from "./useEvents"

export function useDeleteEvent() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return eventService.delete(storeId, id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventKeys.stats(storeId!) })
    },
  })
}
