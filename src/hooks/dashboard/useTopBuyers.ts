"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { TopBuyersResponse } from "@/types"
import { dashboardKeys } from "./useDashboardStats"

export function useTopBuyers() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: dashboardKeys.topBuyers(storeId ?? ""),
    queryFn: async (): Promise<TopBuyersResponse> => {
      const token = await getToken()
      return dashboardService.getTopBuyers(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
