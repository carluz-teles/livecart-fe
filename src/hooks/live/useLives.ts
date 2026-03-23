"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { liveService } from "@/services/api/live.service"
import { useStoreId } from "@/hooks/useUser"
import type { LiveListParams, LiveListResponse } from "@/types/live.types"

export const liveKeys = {
  all: ["lives"] as const,
  lists: () => [...liveKeys.all, "list"] as const,
  list: (storeId: string, params?: LiveListParams) => [...liveKeys.lists(), storeId, params] as const,
  details: () => [...liveKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) => [...liveKeys.details(), storeId, id] as const,
  stats: (storeId: string) => [...liveKeys.all, "stats", storeId] as const,
}

export function useLives(params?: LiveListParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: liveKeys.list(storeId ?? "", params),
    queryFn: async (): Promise<LiveListResponse> => {
      const token = await getToken()
      return liveService.list(storeId!, params, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
