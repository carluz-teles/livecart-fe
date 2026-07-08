"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { dashboardService } from "@/services/api/dashboard.service"
import { useStoreId } from "@/hooks/useUser"
import type { PeriodRange } from "@/types/dashboard.types"

// Redesign jul/2026: todos os números do dashboard respondem pelo MESMO período.
export function useOverview(range: PeriodRange) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: ["dashboard", "overview", storeId ?? "", range.from, range.to],
    queryFn: async () => {
      const token = await getToken()
      return dashboardService.getOverview(storeId!, range, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}

export function useRevenueSeries(range: PeriodRange, bucket: "day" | "week" | "month") {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: ["dashboard", "series", storeId ?? "", range.from, range.to, bucket],
    queryFn: async () => {
      const token = await getToken()
      return dashboardService.getRevenueSeries(storeId!, range, bucket, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
