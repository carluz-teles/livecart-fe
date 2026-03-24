"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { liveService } from "@/services/api/live.service"
import { useStoreId } from "@/hooks/useUser"
import { liveKeys } from "./useLives"

export function useDeleteLive() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return liveService.delete(storeId, id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: liveKeys.stats(storeId) })
      }
    },
  })
}
