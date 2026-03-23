"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { liveService } from "@/services/api/live.service"
import { useStoreId } from "@/hooks/useUser"
import type { LiveSession } from "@/types/live.types"
import { liveKeys } from "./useLives"

export function useStartLive() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<LiveSession> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return liveService.start(storeId, id, token)
    },
    onSuccess: (data, id) => {
      if (storeId) {
        queryClient.setQueryData(liveKeys.detail(storeId, id), data)
      }
      queryClient.invalidateQueries({ queryKey: liveKeys.lists() })
    },
  })
}

export function useEndLive() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<LiveSession> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return liveService.end(storeId, id, token)
    },
    onSuccess: (data, id) => {
      if (storeId) {
        queryClient.setQueryData(liveKeys.detail(storeId, id), data)
      }
      queryClient.invalidateQueries({ queryKey: liveKeys.lists() })
    },
  })
}
