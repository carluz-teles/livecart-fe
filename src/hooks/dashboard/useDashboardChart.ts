"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { MonthlyRevenueResponse } from "@/types"
import { dashboardKeys } from "./useDashboardStats"

export function useDashboardChart() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: dashboardKeys.chart(storeId ?? ""),
    queryFn: async (): Promise<MonthlyRevenueResponse> => {
      const token = await getToken()
      return dashboardService.getMonthlyRevenue(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
