"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { liveService } from "@/services/api/live.service"
import { useStoreId } from "@/hooks/useUser"
import type { UpdateLiveSessionPayload, LiveSession } from "@/types/live.types"
import { liveKeys } from "./useLives"

interface UpdateLiveParams {
  id: string
  payload: UpdateLiveSessionPayload
}

export function useUpdateLive() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateLiveParams): Promise<LiveSession> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return liveService.update(storeId, id, payload, token)
    },
    onSuccess: (data, variables) => {
      if (storeId) {
        queryClient.setQueryData(liveKeys.detail(storeId, variables.id), data)
      }
      queryClient.invalidateQueries({ queryKey: liveKeys.lists() })
    },
  })
}
