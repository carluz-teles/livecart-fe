"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { InstagramMediaResponse } from "@/types"

export const instagramMediaKeys = {
  all: ["instagram", "media"] as const,
  list: (storeId: string) => [...instagramMediaKeys.all, storeId] as const,
}

export function useInstagramMedia(enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useInfiniteQuery({
    queryKey: instagramMediaKeys.list(storeId ?? ""),
    queryFn: async ({ pageParam }): Promise<InstagramMediaResponse> => {
      const token = await getToken()
      return integrationService.getInstagramMedia(storeId!, pageParam, token)
    },
    initialPageParam: "" as string,
    getNextPageParam: (lastPage) => lastPage.after || undefined,
    enabled: enabled && isLoaded && isSignedIn && !storeLoading && !!storeId,
    staleTime: 30000,
  })
}
