"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { TopProductsResponse } from "@/types"
import { dashboardKeys } from "./useDashboardStats"
import type { PeriodRange } from "@/types/dashboard.types"

export function useTopProducts(range?: PeriodRange) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: [...dashboardKeys.topProducts(storeId ?? ""), range?.from ?? "", range?.to ?? ""],
    queryFn: async (): Promise<TopProductsResponse> => {
      const token = await getToken()
      return dashboardService.getTopProducts(storeId!, token, range)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
