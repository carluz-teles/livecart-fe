"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { EventsWithRevenueResponse, AggregatedFunnel } from "@/types"
import { dashboardKeys } from "./useDashboardStats"

export const analyticsKeys = {
  eventsWithRevenue: (storeId: string, limit: number) =>
    [...dashboardKeys.all, "analytics", "events", storeId, limit] as const,
  aggregatedFunnel: (storeId: string, days: number) =>
    [...dashboardKeys.all, "analytics", "funnel", storeId, days] as const,
}

export function useEventsWithRevenue(limit: number = 20) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: analyticsKeys.eventsWithRevenue(storeId ?? "", limit),
    queryFn: async (): Promise<EventsWithRevenueResponse> => {
      const token = await getToken()
      return dashboardService.getEventsWithRevenue(storeId!, token, limit)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}

export function useAggregatedFunnel(days: number = 30) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: analyticsKeys.aggregatedFunnel(storeId ?? "", days),
    queryFn: async (): Promise<AggregatedFunnel> => {
      const token = await getToken()
      return dashboardService.getAggregatedFunnel(storeId!, token, days)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
