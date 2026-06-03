"use client"

import { useQuery } from "@tanstack/react-query"
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

  return useQuery({
    queryKey: instagramMediaKeys.list(storeId ?? ""),
    queryFn: async (): Promise<InstagramMediaResponse> => {
      const token = await getToken()
      return integrationService.getInstagramMedia(storeId!, token)
    },
    enabled: enabled && isLoaded && isSignedIn && !storeLoading && !!storeId,
    staleTime: 30000,
  })
}
