"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { integrationService } from "@/services/api/integration.service"
import { useStoreId } from "@/hooks/useUser"
import type { InstagramLivesResponse } from "@/types"

export const instagramLivesKeys = {
  all: ["instagram", "lives"] as const,
  list: (storeId: string) => [...instagramLivesKeys.all, storeId] as const,
}

export function useInstagramLives() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: instagramLivesKeys.list(storeId ?? ""),
    queryFn: async (): Promise<InstagramLivesResponse> => {
      const token = await getToken()
      return integrationService.getInstagramLives(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
    refetchInterval: 30000, // Refetch every 30 seconds to detect new lives
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}
