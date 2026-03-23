"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { liveService } from "@/services/api/live.service"
import { useStoreId } from "@/hooks/useUser"
import type { CreateLiveSessionPayload, LiveSession } from "@/types/live.types"
import { liveKeys } from "./useLives"

export function useCreateLive() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateLiveSessionPayload): Promise<LiveSession> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return liveService.create(storeId, payload, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveKeys.lists() })
    },
  })
}
