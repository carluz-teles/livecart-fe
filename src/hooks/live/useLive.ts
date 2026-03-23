"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { liveService } from "@/services/api/live.service"
import { useStoreId } from "@/hooks/useUser"
import type { LiveSession } from "@/types/live.types"
import { liveKeys } from "./useLives"

export function useLive(id: string | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: liveKeys.detail(storeId ?? "", id || ""),
    queryFn: async (): Promise<LiveSession> => {
      if (!id) throw new Error("Live ID is required")
      const token = await getToken()
      return liveService.getById(storeId!, id, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
