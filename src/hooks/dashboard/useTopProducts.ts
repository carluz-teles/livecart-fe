"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { TopProductsResponse } from "@/types"
import { dashboardKeys } from "./useDashboardStats"

export function useTopProducts() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: dashboardKeys.topProducts(storeId ?? ""),
    queryFn: async (): Promise<TopProductsResponse> => {
      const token = await getToken()
      return dashboardService.getTopProducts(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
