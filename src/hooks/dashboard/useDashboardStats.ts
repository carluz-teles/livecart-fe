"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { DashboardStats } from "@/types"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (storeId: string) => [...dashboardKeys.all, "stats", storeId] as const,
  chart: (storeId: string) => [...dashboardKeys.all, "chart", storeId] as const,
  topProducts: (storeId: string) => [...dashboardKeys.all, "top-products", storeId] as const,
  topBuyers: (storeId: string) => [...dashboardKeys.all, "top-buyers", storeId] as const,
  productSales: (storeId: string) => [...dashboardKeys.all, "product-sales", storeId] as const,
}

export function useDashboardStats() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: dashboardKeys.stats(storeId ?? ""),
    queryFn: async (): Promise<DashboardStats> => {
      const token = await getToken()
      return dashboardService.getStats(storeId!, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
