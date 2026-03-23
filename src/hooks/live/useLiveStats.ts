"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { liveService } from "@/services/api/live.service"
import { useStoreId } from "@/hooks/useUser"
import type { LiveStats } from "@/types/live.types"
import { liveKeys } from "./useLives"

export function useLiveStats() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: liveKeys.stats(storeId ?? ""),
    queryFn: async (): Promise<LiveStats> => {
      const token = await getToken()
      return liveService.getStats(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
